"use client";

import ApplicationCard from "@/components/ApplicationCard";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  useGetApplicationsQuery,
  useGetAuthUserQuery,
  useDeleteApplicationMutation,
} from "@/state/api";
import { CircleCheckBig, Clock, Download, XCircle, Trash2 } from "lucide-react";
import React from "react";

const Applications = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const {
    data: applications,
    isLoading,
    isError,
  } = useGetApplicationsQuery({
    userId: authUser?.cognitoInfo?.userId,
    userType: "tenant",
  });

  // xoá application
  const [deleteApplication] = useDeleteApplicationMutation();
  
  const [applicationsList, setApplicationsList] = React.useState<any[]>([]);

  React.useEffect(() => {
  if (applications) setApplicationsList(applications);
  }, [applications]);

const handleDelete = async (id: string) => {
  if (!confirm("Bạn có chắc muốn xoá đơn ứng tuyển này không?")) return;
  try {
    await deleteApplication(id).unwrap();
    // Loại bỏ application khỏi state local
    setApplicationsList((prev) => prev.filter((app) => app.id !== id));
    alert("Đã xoá thành công!");
  } catch (error) {
    console.error("Lỗi khi xoá đơn:", error);
    alert("Xoá thất bại. Vui lòng thử lại!");
  }
};

  
  if (isLoading) return <Loading />;
  if (isError || !applications) return <div>Error fetching applications</div>;

  return (
    <div className="dashboard-container">
      <Header
        title="Ứng dụng"
        subtitle="Theo dõi và quản lý các đơn xin cho thuê bất động sản của bạn"
      />
      <div className="w-full">
        {applicationsList?.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            userType="renter"
          >
            <div className="flex justify-between gap-5 w-full pb-4 px-4">
              {application.status === "Approved" ? (
                <div className="bg-green-100 p-4 text-green-700 grow flex items-center">
                  <CircleCheckBig className="w-5 h-5 mr-2" />
                  Bất động sản đang được bạn thuê cho đến khi{" "}
                  {new Date(application.lease?.endDate).toLocaleDateString()}
                </div>
              ) : application.status === "Pending" ? (
                <div className="bg-yellow-100 p-4 text-yellow-700 grow flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Đơn đăng ký của bạn đang chờ phê duyệt
                </div>
              ) : (
                <div className="bg-red-100 p-4 text-red-700 grow flex items-center">
                  <XCircle className="w-5 h-5 mr-2" />
                  Đơn của bạn đã bị từ chối
                </div>
              )}

              <div className="flex gap-3">
                <button
                  className={`bg-white border border-gray-300 text-gray-700 py-2 px-4
                            rounded-md flex items-center justify-center hover:bg-primary-700 hover:text-primary-50`}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Tải xuống hợp đồng
                </button>

                <button
                  onClick={() => handleDelete(application.id)}
                  className="bg-red-100 border border-red-300 text-red-700 py-2 px-4 rounded-md flex items-center justify-center hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Xoá
                </button>
              </div>
            </div>
          </ApplicationCard>
        ))}
      </div>
    </div>
  );
};

export default Applications;
