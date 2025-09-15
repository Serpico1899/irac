import { ActFn } from "@deps";
import { productService } from "../productService.ts";
import { coreApp } from "../../../mod.ts";
import { order_models } from "@model";
import { scoringService } from "../../scoring/scoringService.ts";
import { referralService } from "../../referral/referralService.ts";

export const purchaseProductFn: ActFn = async (body) => {
  try {
    const {
      items,
      payment_method,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      billing_address,
      use_different_billing,
      notes,
      discount_code,
      referral_code,
      express_delivery,
      delivery_notes,
      terms_accepted,
      newsletter_subscribe,
      order_source,
      client_ip,
      user_agent,
    } = body.details.set;

    const userId = body.user?._id;

    // Validate terms acceptance
    if (!terms_accepted) {
      return {
        success: false,
        message: "Terms and conditions must be accepted",
        details: { terms_accepted: false },
      };
    }

    // Validate cart items are provided
    if (!items || items.length === 0) {
      return {
        success: false,
        message: "Cart cannot be empty",
        details: { items_count: 0 },
      };
    }

    const orderModel = order_models();
    const processedItems: any[] = [];
    let hasPhysicalProducts = false;
    let hasDigitalProducts = false;
    let subtotal = 0;

    // Process each cart item
    for (const item of items) {
      // Get product details
      const productResult = await productService.getProduct(item.product_id);

      if (!productResult.success) {
        return {
          success: false,
          message: `Product not found: ${item.product_id}`,
          details: { invalid_product_id: item.product_id },
        };
      }

      const product = productResult.data;

      // Check product availability
      const availabilityResult = await productService.checkProductAvailability(item.product_id);

      if (!availabilityResult.success || !availabilityResult.data.available) {
        return {
          success: false,
          message: `Product not available: ${product.title}`,
          details: {
            product_id: item.product_id,
            product_title: product.title,
            availability: availabilityResult.data,
          },
        };
      }

      // Check stock for physical products
      if (!product.is_digital) {
        hasPhysicalProducts = true;
        if (product.stock_quantity !== undefined && product.stock_quantity < item.quantity) {
          return {
            success: false,
            message: `Insufficient stock for ${product.title}`,
            details: {
              product_id: item.product_id,
              product_title: product.title,
              requested_quantity: item.quantity,
              available_stock: product.stock_quantity,
            },
          };
        }
      } else {
        hasDigitalProducts = true;
      }

      // Verify expected price if provided
      if (item.expected_price !== undefined && item.expected_price !== product.price) {
        return {
          success: false,
          message: `Price has changed for ${product.title}`,
          details: {
            product_id: item.product_id,
            product_title: product.title,
            expected_price: item.expected_price,
            current_price: product.price,
          },
        };
      }

      // Calculate item total
      const itemPrice = product.discounted_price || product.price;
      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      // Add to processed items
      processedItems.push({
        item_id: item.product_id,
        item_type: "product",
        name: product.title,
        name_en: product.title_en,
        price: product.price,
        discounted_price: product.discounted_price,
        quantity: item.quantity,
        total: itemTotal,
        metadata: JSON.stringify({
          is_digital: product.is_digital,
          category: product.category,
          type: product.type,
          file_url: product.file_url,
          file_format: product.file_format,
        }),
      });
    }

    // Validate shipping address for physical products
    if (hasPhysicalProducts && !shipping_address) {
      return {
        success: false,
        message: "Shipping address is required for physical products",
        details: {
          has_physical_products: true,
          shipping_address_provided: false,
        },
      };
    }

    // Calculate shipping cost
    let shippingCost = 0;
    if (hasPhysicalProducts) {
      shippingCost = express_delivery ? 50000 : 25000; // Example shipping costs in IRR
    }

    // Calculate discount (placeholder - implement actual discount logic)
    let discountAmount = 0;
    if (discount_code) {
      // Implement discount code logic here
      // For now, just a placeholder
    }

    // Calculate tax (placeholder)
    const taxAmount = 0; // Iran usually doesn't have separate tax display

    // Calculate total
    const totalAmount = subtotal + shippingCost - discountAmount + taxAmount;

    // Generate order number
    const orderNumber = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Determine order type
    let orderType = "product";
    if (hasPhysicalProducts && hasDigitalProducts) {
      orderType = "mixed";
    }

    // Prepare order data
    const orderData = {
      order_number: orderNumber,
      order_id: coreApp.odm.ObjectId().toString(),
      status: "pending",
      payment_status: "pending",
      order_type: orderType,
      items: processedItems,
      subtotal,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      currency: "IRR",
      customer_name,
      customer_email,
      customer_phone,
      billing_address: use_different_billing && billing_address ?
        `${billing_address.full_address}, ${billing_address.city}, ${billing_address.postal_code}` :
        shipping_address ? `${shipping_address.full_address}, ${shipping_address.city}, ${shipping_address.postal_code}` : undefined,
      billing_city: use_different_billing && billing_address ? billing_address.city : shipping_address?.city,
      billing_postal_code: use_different_billing && billing_address ? billing_address.postal_code : shipping_address?.postal_code,
      billing_country: use_different_billing && billing_address ? billing_address.country || "Iran" : "Iran",
      shipping_address: shipping_address ? `${shipping_address.full_address}, ${shipping_address.city}, ${shipping_address.postal_code}` : undefined,
      shipping_city: shipping_address?.city,
      shipping_postal_code: shipping_address?.postal_code,
      shipping_country: shipping_address?.country || "Iran",
      shipping_cost: shippingCost,
      payment_method,
      admin_notes: notes,
      internal_notes: JSON.stringify({
        order_source: order_source || "web",
        client_ip,
        user_agent,
        express_delivery,
        delivery_notes,
        newsletter_subscribe,
        discount_code,
        referral_code,
        has_physical_products: hasPhysicalProducts,
        has_digital_products: hasDigitalProducts,
      }),
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Create order
    const orderResult = await orderModel.insertOne({
      ...orderData,
      user: userId ? { _id: coreApp.odm.ObjectId(userId) } : undefined,
    });

    if (!orderResult.insertedId) {
      return {
        success: false,
        message: "Failed to create order",
        details: { order_creation_failed: true },
      };
    }

    // Award points for purchase if user is authenticated
    if (userId) {
      try {
        const purchasePoints = scoringService.calculatePurchasePoints(totalAmount, "IRR");

        if (purchasePoints > 0) {
          await scoringService.awardPoints({
            userId: userId.toString(),
            action: "purchase",
            points: purchasePoints,
            description: `Purchase reward for order ${orderNumber}`,
            metadata: {
              order_number: orderNumber,
              total_amount: totalAmount,
              currency: "IRR",
              items_count: items.length,
              has_physical_products: hasPhysicalProducts,
              has_digital_products: hasDigitalProducts,
            },
            referenceId: orderResult.insertedId.toString(),
            referenceType: "order",
            orderId: orderResult.insertedId.toString(),
          });
        }
      } catch (error) {
        console.error("Error awarding purchase points:", error);
        // Continue with order processing even if scoring fails
      }
    }

    // Process referral rewards if user is authenticated
    if (userId) {
      try {
        await referralService.processReferralReward({
          orderId: orderResult.insertedId.toString(),
          purchaseAmount: totalAmount,
          currency: "IRR",
          buyerId: userId.toString(),
        });
      } catch (error) {
        console.error("Error processing referral reward:", error);
        // Continue with order processing even if referral processing fails
      }
    }

    // Handle payment processing based on method
    let paymentResult: any = null;

    if (payment_method === "wallet" && userId) {
      // Process wallet payment
      // This would integrate with the wallet service
      paymentResult = {
        success: true,
        payment_status: "pending",
        message: "Wallet payment initiated",
      };
    } else if (payment_method === "zarinpal") {
      // Process ZarinPal payment
      // This would integrate with the ZarinPal service
      paymentResult = {
        success: true,
        payment_status: "pending",
        message: "ZarinPal payment initiated",
        redirect_url: `${Deno.env.get("PAYMENT_CALLBACK_URL") || "http://localhost:3000"}/payment/verify?order=${orderResult.insertedId}`,
      };
    } else if (payment_method === "bank_transfer") {
      // Bank transfer payment
      paymentResult = {
        success: true,
        payment_status: "pending",
        message: "Bank transfer payment initiated",
      };
    }

    // If payment is successful, reserve inventory
    if (paymentResult?.success) {
      for (const item of items) {
        const product = processedItems.find(p => p.item_id === item.product_id);
        if (product && JSON.parse(product.metadata).is_digital === false) {
          // Reserve inventory (don't actually decrease until payment confirmed)
          await productService.updateInventory(item.product_id, 0); // Just validate
        }
      }
    }

    return {
      success: true,
      body: {
        order: {
          order_id: orderResult.insertedId,
          order_number: orderNumber,
          status: "pending",
          payment_status: "pending",
          total_amount: totalAmount,
          currency: "IRR",
          payment_method,
          items: processedItems,
        },
        payment: paymentResult,
        summary: {
          subtotal,
          shipping_cost: shippingCost,
          discount_amount: discountAmount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          items_count: items.length,
          has_physical_products: hasPhysicalProducts,
          has_digital_products: hasDigitalProducts,
        },
        next_steps: {
          payment_required: paymentResult?.payment_status === "pending",
          payment_method,
          redirect_url: paymentResult?.redirect_url,
        },
      },
    };
  } catch (error) {
    console.error("Error in purchaseProduct function:", error);
    return {
      success: false,
      message: "Internal server error while processing purchase",
      details: {
        error: error.message || "Unknown error",
        stack: error.stack,
        user_id: body.user?._id,
        items_count: body.details.set.items?.length || 0,
      },
    };
  }
};
