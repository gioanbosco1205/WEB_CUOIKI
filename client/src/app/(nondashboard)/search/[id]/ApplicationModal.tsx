import { CustomFormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ApplicationFormData, applicationSchema } from "@/lib/schemas";
import { useCreateApplicationMutation, useGetAuthUserQuery } from "@/state/api";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";

const ApplicationModal = ({
  isOpen,
  onClose,
  propertyId,
}: ApplicationModalProps) => {
  const [createApplication] = useCreateApplicationMutation();
  const { data: authUser } = useGetAuthUserQuery();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      message: "",
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    if (!authUser || authUser.userRole !== "tenant") {
      console.error(
        "Bạn phải đăng nhập với tư cách là người thuê nhà để gửi đơn đăng ký"
      );
      return;
    }

    await createApplication({
      ...data,
      applicationDate: new Date().toISOString(),
      status: "Pending",
      propertyId: propertyId,
      tenantCognitoId: authUser.cognitoInfo.userId,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader className="mb-4">
          <DialogTitle>Đăng ký thuê </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <CustomFormField
              name="name"
              label="Tên của bạn"
              type="text"
              placeholder="Vui lòng nhập tên đầy đủ của bạn"
            />
            <CustomFormField
              name="email"
              label="Email"
              type="email"
              placeholder="Vui lòng nhập địa chỉ email của bạn"
            />
            <CustomFormField
              name="phoneNumber"
              label="Số điện thoại"
              type="text"
              placeholder="Vui lòng nhập số điện thoại của bạn"
            />
            <CustomFormField
              name="message"
              label="Tin nhắn (Tùy chọn)"
              type="textarea"
              placeholder="Nhập thông tin bổ sung nếu có"
            />
            <Button type="submit" className="bg-primary-700 text-white w-full">
              Gửi đơn đăng ký
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;
