import type { ActFn, Document, WithId } from "@deps";
import { throwError } from "@lib";
import {  myRedis, user  } from "@app";


const checkNationalNumber = async (mobile: string, national_number: string) => {
  // TODO check SHAHKAR Api
  return true;
};

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

export const changeMobileFn: ActFn = async (body) => {
  const {
    set: { national_number, mobile },
    get,
  } = body.details;

  const foundedUserWithNewMobileNumber = await user.findOne({
    filters: { mobile },
  });

  if (foundedUserWithNewMobileNumber?.national_number === national_number) {
    throwError(
      "شماره ملی کاربر دقیقا همین شماره ملی است و نیازی به تغییر شماره موبایل نیست"
    );
  }

  if (foundedUserWithNewMobileNumber) {
    throwError("این شماره در سامانه موجود میباشد و متعلق به کاربر دیگری است");
  }

  const checkNewMobileBelognsToNationalNumber = await checkNationalNumber(
    mobile,
    national_number
  );

  if (!checkNewMobileBelognsToNationalNumber) {
    throwError("این شماره موبایل متعلق به این شماره ملی نیست");
  }

  const generatedCode =
    Deno.env.get("ENV") === "development"
      ? "11111"
      : generateSecureCode();

  const returnUser = async (user: WithId<Document>) => {
    await myRedis.set(user.national_number, generatedCode, { ex: 100 });
    const mobile = user.mobile as string;
    user.mobile = `${mobile.slice(0, 3)}****${mobile.slice(-3)}`;
    return user;
  };

  const foundedUser = await user.findOneAndUpdate({
    filter: { national_number },
    update: {
      $set: {
        mobile,
        updatedAt: new Date(),
      },
    },
    projection: { _id: 0, mobile: 1, national_number: 1 },
  });

  return foundedUser
    ? await returnUser(foundedUser as WithId<Document>)
    : throwError("با این شماره ملی هیچ کاربری پیدا نشد");
};
