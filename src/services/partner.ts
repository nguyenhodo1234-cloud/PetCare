import api from "./api";

export interface PartnerRegisterPayload {
  businessType: string;
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  businessLicense?: File;
  vetCertificate?: File;
}

export async function submitPartnerRegistration(data: PartnerRegisterPayload) {
  const fd = new FormData();
  fd.append("businessType", data.businessType);
  fd.append("shopName", data.shopName);
  fd.append("ownerName", data.ownerName);
  fd.append("phone", data.phone);
  fd.append("email", data.email);
  fd.append("address", data.address);
  if (data.businessLicense) fd.append("businessLicense", data.businessLicense);
  if (data.vetCertificate) fd.append("vetCertificate", data.vetCertificate);

  const res = await api.post("/partner/register", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
