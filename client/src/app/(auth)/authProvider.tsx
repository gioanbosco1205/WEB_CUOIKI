"use client";

import React, { useEffect } from "react";
import { Amplify } from "aws-amplify";
import {
  Authenticator,
  Heading,
  Radio,
  RadioGroupField,
  useAuthenticator,
  View,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useRouter, usePathname } from "next/navigation";
import { translations } from "@aws-amplify/ui-react";

// https://docs.amplify.aws/gen1/javascript/tools/libraries/configure-categories/
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
      userPoolClientId:
        process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!,
    },
  },
});

import { I18n } from "aws-amplify/utils";
const viVocab = {
  vi: {
    "Sign In": "Đăng nhập",
    "Sign in": "Đăng nhập",
    "Sign Up": "Đăng ký",
    "Sign up": "Đăng ký",
    "Sign Out": "Đăng xuất",
    "Create Account": "Đăng ký",
    "Forgot your password?": "Quên mật khẩu?",
    "Reset Password": "Đặt lại mật khẩu",
    "Send Code": "Gửi mã",
    "Resend Code": "Gửi lại mã",
    "Confirm": "Xác nhận",
    "Submit": "Xác nhận",
    "Back to Sign In": "Quay lại đăng nhập",
  },
};
I18n.putVocabularies(translations);
I18n.putVocabularies(viVocab);
I18n.setLanguage("vi");

const components = {
  Header() {
    return (
      <View className="mt-4 mb-7">
        <Heading level={3} className="!text-2xl !font-bold">
          MINH
          <span className="text-secondary-500 font-light hover:!text-primary-300">
            KHANH
          </span>
        </Heading>
        <p className="text-muted-foreground mt-2">
          <span className="font-bold">Chào mừng!</span> Hãy tiếp tục đến với phần đăng nhập 
        </p>
      </View>
    );
  },
  
  SignIn: {
    Footer() {
      const { toSignUp } = useAuthenticator();
      
      return (
        <View className="text-center mt-4">
          <p className="text-muted-foreground">
            Bạn chưa có tài khoản?{" "}
            <button
              onClick={toSignUp}
              className="text-primary hover:underline bg-transparent border-none p-0"
            >
              Hãy đăng ký tại đây
            </button>
          </p>
        </View>
      );
    },
  },
  SignUp: {
    FormFields() {
      const { validationErrors } = useAuthenticator();

      return (
        <>
          <Authenticator.SignUp.FormFields />
          <RadioGroupField
            legend="Vai trò"
            name="custom:role"
            errorMessage={validationErrors?.["custom:role"]}
            hasError={!!validationErrors?.["custom:role"]}
            isRequired
          >
            <Radio value="tenant">Người thuê</Radio>
            <Radio value="manager">Quản lý</Radio>
          </RadioGroupField>
        </>
      );
    },

    Footer() {
      const { toSignIn } = useAuthenticator();
      return (
        <View className="text-center mt-4">
          <p className="text-muted-foreground">
            Đã có tài khoản? ?{" "}
            <button
              onClick={toSignIn}
              className="text-primary hover:underline bg-transparent border-none p-0"
            >
              Đăng nhập
            </button>
          </p>
        </View>
      );
    },
  },
};

const formFields = {
  signIn: {
    username: {
      placeholder: "Nhập email của bạn",
      label: "Email",
      isRequired: true,
    },
    password: {
      placeholder: "Nhập mật khẩu của bạn",
      label: "Mật khẩu",
      isRequired: true,
    },
  },
  signUp: {
    username: {
      order: 1,
      placeholder: "Chọn tên người dùng",
      label: "Tên người dùng",
      isRequired: true,
    },
    email: {
      order: 2,
      placeholder: "Nhập địa chỉ email của bạn",
      label: "Email",
      isRequired: true,
    },
    password: {
      order: 3,
      placeholder: "Tạo mật khẩu",
      label: "Mật khẩu",
      isRequired: true,
    },
    confirm_password: {
      order: 4,
      placeholder: "Xác nhận mật khẩu của bạn",
      label: "Xác nhận lại mật khẩu của bạn",
      isRequired: true,
    },
  },
};

const Auth = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthenticator((context) => [context.user]); /// lay trang thai nguoi dung 
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.match(/^\/(signin|signup)$/);
  const isDashboardPage =
    pathname.startsWith("/manager") || pathname.startsWith("/tenants");


    useEffect(() => {  /// dang nhap thanh cong 
    if (user && isAuthPage) {
      router.push("/landing");
    }
  }, [user, isAuthPage, router]);

  if (!isAuthPage && !isDashboardPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-full">
      <Authenticator
        initialState={pathname.includes("signup") ? "signUp" : "signIn"}
        components={components}
        formFields={formFields}
      >

        {() => <>{children}</>}
      </Authenticator>
    </div>
  );
};

export default Auth;
