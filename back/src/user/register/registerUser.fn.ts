import type { ActFn, Document, WithId } from "@deps";
import {  myRedis, user  } from "@app";
import { throwError } from "@lib";


function generateSecureCode(): string {
  // Use crypto.getRandomValues for secure random generation
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const randomValue = array[0];

  // Generate 5-digit code
  let code = (randomValue % 90000 + 10000).toString();

  // Avoid common patterns
  if (isWeakCode(code)) {
    return generateSecureCode(); // Regenerate if weak
  }

  return code;
}

function isWeakCode(code: string): boolean {
  // Check for sequential numbers
  const isSequential = /^(?:12345|23456|34567|45678|56789|54321|43210|32109|21098)$/.test(code);

  // Check for repeated digits
  const isRepeated = /^(\d)\1{4}$/.test(code);

  // Check for common weak patterns
  const weakPatterns = ["00000", "11111", "12312", "45645"];
  const isCommon = weakPatterns.includes(code);

  return isSequential || isRepeated || isCommon;
}

export const registerUserFn: ActFn = async (body) => {
  const {
    set: { mobile, national_number },
    get,
  } = body.details;

  const foundedUserWithNationalNumber = await user.findOne({
    filters: { national_number },
  });

  if (foundedUserWithNationalNumber) {
    return throwError("این شماره ملی قبلا ثبت نام شده است");
  }

  const foundedUserWithMobileNumber = await user.findOne({
    filters: { mobile },
  });

  if (foundedUserWithMobileNumber) {
    return throwError("این شماره موبایل قبلا ثبت نام شده است");
  }

  const generatedCode = Deno.env.get("ENV") === "development"
    ? "11111"
    : generateSecureCode();

  const returnUser = async (user: WithId<Document>) => {
    await myRedis.set(user.national_number, generatedCode, { ex: 100 });
    const mobile = user.mobile as string;
    user.mobile = `${mobile.slice(0, 3)}****${mobile.slice(-3)}`;
    return user;
  };

  const registeredUser = await user.insertOne({
    doc: {
      mobile,
      national_number,
      is_verified: false,
      level: "Ordinary",
    },
    projection: get,
  });

  return registeredUser
    ? await returnUser(registeredUser)
    : throwError("کاربر ایجاد نشد");
};
