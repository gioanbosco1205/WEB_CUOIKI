import { useGetLeaseContractQuery } from "@/state/api";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

interface ContractPageProps {
  leaseId: number;
}

export default function ContractPage({ leaseId }: ContractPageProps) {
  const { data: lease, isLoading } = useGetLeaseContractQuery(leaseId);

  if (isLoading) return <p>Đang tải hợp đồng...</p>;
  if (!lease) return <p>Không tìm thấy hợp đồng.</p>;

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFont("Times", "normal");
    doc.text("HỢP ĐỒNG THUÊ PHÒNG", 60, 20);
    doc.text(`Tên người thuê: ${lease.tenant.name}`, 20, 40);
    doc.text(`Địa chỉ phòng: ${lease.property.address}`, 20, 50);
    doc.text(`Giá thuê: ${lease.price} VNĐ/tháng`, 20, 60);
    doc.text(`Thời hạn: ${lease.startDate} đến ${lease.endDate}`, 20, 70);
    doc.text("Ký tên:", 20, 100);
    doc.text("Bên cho thuê", 30, 110);
    doc.text("Bên thuê", 140, 110);
    doc.save(`HopDong_${lease.id}.pdf`);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-xl mt-6">
      <h1 className="text-2xl font-bold text-center mb-4">HỢP ĐỒNG THUÊ PHÒNG</h1>
      <p><strong>Người thuê:</strong> {lease.tenant.name}</p>
      <p><strong>Phòng:</strong> {lease.property.address}</p>
      <p><strong>Giá thuê:</strong> {lease.price} VNĐ/tháng</p>
      <p><strong>Thời gian:</strong> {lease.startDate} - {lease.endDate}</p>

      <div className="flex justify-center mt-8">
        <Button onClick={handleDownload} className="bg-blue-600 text-white">
          Tải hợp đồng PDF
        </Button>
      </div>
    </div>
  );
}