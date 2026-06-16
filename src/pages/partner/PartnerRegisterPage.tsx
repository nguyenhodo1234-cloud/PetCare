import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Upload,
  X,
  FileText,
  Check,
  Loader2,
  Store,
  Stethoscope,
  Scissors,
  ArrowLeft,
} from "lucide-react";
import { submitPartnerRegistration } from "../../services/partner";

// ─── Zod Schema ───
const phoneRegex = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/;

const schema = z.object({
  shopName: z.string().min(1, "Vui lòng nhập tên shop / phòng khám"),
  ownerName: z.string().min(1, "Vui lòng nhập tên người đại diện"),
  phone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(phoneRegex, "Số điện thoại Việt Nam không hợp lệ"),
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Email không đúng định dạng"),
  address: z.string().min(1, "Vui lòng nhập địa chỉ"),
  agree: z.literal(true, {
    message: "Bạn cần đồng ý với điều khoản",
  }),
});

type FormData = z.infer<typeof schema>;

// ─── Business types ───
const BUSINESS_TYPES = [
  {
    id: "clinic",
    label: "Phòng khám thú y",
    icon: Stethoscope,
    desc: "Dành cho bác sĩ thú y & phòng khám",
  },
  {
    id: "shop",
    label: "Cửa hàng thú cưng",
    icon: Store,
    desc: "Dành cho cửa hàng bán đồ thú cưng",
  },
  {
    id: "spa",
    label: "Spa thú cưng",
    icon: Scissors,
    desc: "Dành cho spa, grooming thú cưng",
  },
];

// ─── UploadField Component ───
function UploadField({
  label,
  accept,
  file,
  onChange,
  onRemove,
  error,
}: {
  label: string;
  accept: string;
  file: File | null;
  onChange: (f: File | null) => void;
  onRemove: () => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      onChange(null);
      return;
    }
    onChange(f);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div>
      <label className="block text-sm font-medium text-text mb-1.5">
        {label}
      </label>
      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-xl p-5 flex flex-col items-center gap-2 hover:border-brand/50 hover:bg-brand/5 transition-colors cursor-pointer"
        >
          <Upload size={24} className="text-muted" />
          <span className="text-sm text-muted">
            Tải lên (PDF, JPG, PNG - tối đa 10MB)
          </span>
        </button>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-warm rounded-xl border border-border">
          <FileText size={20} className="text-brand shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text truncate">{file.name}</p>
            <p className="text-xs text-muted">{formatSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {error && <p className="text-xs text-error mt-1">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}

// ─── Success Modal ───
function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-surface rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={36} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-display font-bold text-text mb-3">
          Đăng ký thành công!
        </h2>
        <p className="text-muted text-sm leading-relaxed mb-8">
          PetConnect đã nhận được thông tin của bạn.
          <br />
          Chúng tôi sẽ liên hệ trong vòng 24-48 giờ.
        </p>
        <Link
          to="/"
          onClick={onClose}
          className="btn-brand w-full justify-center !rounded-2xl !h-[52px] !text-base"
        >
          Quay về trang chủ
        </Link>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ───
export default function PartnerRegisterPage() {
  const [businessType, setBusinessType] = useState("");
  const [businessTypeError, setBusinessTypeError] = useState("");
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      shopName: "",
      ownerName: "",
      phone: "",
      email: "",
      address: "",
      agree: false as unknown as true,
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!businessType) {
      setBusinessTypeError("Vui lòng chọn loại hình kinh doanh");
      return;
    }
    setBusinessTypeError("");
    setServerError("");
    setFieldErrors({});
    setLoading(true);

    try {
      await submitPartnerRegistration({
        businessType,
        shopName: data.shopName,
        ownerName: data.ownerName,
        phone: data.phone.replace(/\s/g, ""),
        email: data.email,
        address: data.address,
        businessLicense: licenseFile || undefined,
        vetCertificate: certFile || undefined,
      });
      setShowSuccess(true);
      reset();
      setBusinessType("");
      setLicenseFile(null);
      setCertFile(null);
    } catch (err: any) {
      const field = err?.response?.data?.field;
      const msg =
        err?.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại";
      if (field) {
        setFieldErrors({ [field]: msg });
      } else {
        setServerError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm font-body">
      <div className="container-max">
        {/* Back button */}
        <div className="px-4 pt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted hover:text-text transition-colors text-sm"
          >
            <ArrowLeft size={18} />
            Quay lại trang chủ
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-0 lg:gap-8 px-4 pb-12 pt-4">
          {/* Left Column - Image (desktop only) */}
          <div className="hidden lg:block lg:w-[40%]">
            <div className="sticky top-8">
              <img
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=700&h=900&fit=crop"
                alt="Vet with pet"
                className="w-full h-[calc(100vh-6rem)] object-cover rounded-3xl shadow-xl"
              />
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:w-[60%] max-w-2xl">
            <div className="mb-8">
              <h1 className="font-display text-2xl lg:text-3xl font-extrabold text-text mb-3">
                Đưa cửa hàng của bạn đến gần hơn với pet lovers
              </h1>
              <p className="text-muted text-sm leading-relaxed">
                Chỉ vài thông tin để PetConnect hiểu hơn về cửa hàng của bạn và
                cùng xây dựng trải nghiệm chăm sóc thú cưng tiện lợi.
              </p>
            </div>

            {/* Business Type Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-text mb-3">
                Loại hình kinh doanh <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BUSINESS_TYPES.map((bt) => {
                  const Icon = bt.icon;
                  const selected = businessType === bt.id;
                  return (
                    <button
                      key={bt.id}
                      type="button"
                      onClick={() => {
                        setBusinessType(bt.id);
                        setBusinessTypeError("");
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                        selected
                          ? "border-green-500 bg-green-50"
                          : "border-border hover:border-brand/30 hover:bg-warm"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                          selected
                            ? "bg-green-500 text-white"
                            : "bg-brand/10 text-brand"
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <p className="font-semibold text-text text-sm">
                        {bt.label}
                      </p>
                      <p className="text-xs text-muted mt-1">{bt.desc}</p>
                    </button>
                  );
                })}
              </div>
              {businessTypeError && (
                <p className="text-xs text-error mt-2">{businessTypeError}</p>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputField
                  label="Tên shop / phòng khám"
                  placeholder="VD: PetCare Clinic"
                  register={register("shopName")}
                  error={errors.shopName?.message}
                />
                <InputField
                  label="Tên chủ shop (người đại diện)"
                  placeholder="VD: Nguyễn Văn A"
                  register={register("ownerName")}
                  error={errors.ownerName?.message}
                />
                <InputField
                  label="Số điện thoại"
                  placeholder="VD: 0912345678"
                  register={register("phone", {
                    onChange: () =>
                      setFieldErrors((p) => ({ ...p, phone: "" })),
                  })}
                  error={errors.phone?.message}
                  fieldError={fieldErrors.phone}
                  type="tel"
                />
                <InputField
                  label="Email liên hệ"
                  placeholder="VD: contact@shop.com"
                  register={register("email", {
                    onChange: () =>
                      setFieldErrors((p) => ({ ...p, email: "" })),
                  })}
                  error={errors.email?.message}
                  fieldError={fieldErrors.email}
                  type="email"
                />
              </div>

              <InputField
                label="Địa chỉ cửa hàng"
                placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
                register={register("address")}
                error={errors.address?.message}
              />

              {/* Upload Documents */}
              <div className="space-y-4 pt-2">
                <p className="text-sm font-semibold text-text">
                  Giấy tờ xác minh
                </p>
                <UploadField
                  label="Giấy phép kinh doanh"
                  accept=".pdf,.jpg,.jpeg,.png"
                  file={licenseFile}
                  onChange={setLicenseFile}
                  onRemove={() => setLicenseFile(null)}
                />
                <UploadField
                  label="Chứng chỉ bác sĩ thú y"
                  accept=".pdf,.jpg,.jpeg,.png"
                  file={certFile}
                  onChange={setCertFile}
                  onRemove={() => setCertFile(null)}
                />
              </div>

              {/* Agreement Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group pt-2">
                <input
                  type="checkbox"
                  {...register("agree")}
                  className="mt-0.5 w-4 h-4 rounded border-border text-brand focus:ring-brand/20 accent-brand"
                />
                <span className="text-sm text-muted group-hover:text-text transition-colors">
                  Tôi xác nhận các thông tin trên là chính xác và đồng ý với{" "}
                  <span className="text-brand font-medium">điều khoản</span> của
                  PetConnect.
                </span>
              </label>
              {errors.agree && (
                <p className="text-xs text-error">{errors.agree.message}</p>
              )}

              {/* Server Error */}
              {serverError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{serverError}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] rounded-2xl font-semibold text-white text-base flex items-center justify-center gap-2 transition-all duration-200"
                style={{ background: loading ? "#0ca678" : "#0E9F6E" }}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi đăng ký"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Input Field ───
function InputField({
  label,
  placeholder,
  register,
  error,
  fieldError,
  type = "text",
}: {
  label: string;
  placeholder: string;
  register: any;
  error?: string;
  fieldError?: string;
  type?: string;
}) {
  const hasError = error || fieldError;
  return (
    <div>
      <label className="block text-sm font-medium text-text mb-1.5">
        {label} <span className="text-error">*</span>
      </label>
      <input
        type={type}
        placeholder={placeholder}
        {...register}
        className={`w-full px-4 py-3 bg-surface border rounded-xl text-sm text-text placeholder-muted focus:outline-none focus:ring-2 transition-all ${
          hasError
            ? "border-error focus:ring-error/20"
            : "border-border focus:ring-brand/20 focus:border-brand/50"
        }`}
      />
      {error && <p className="text-xs text-error mt-1">{error}</p>}
      {!error && fieldError && (
        <p className="text-xs text-error mt-1">{fieldError}</p>
      )}
    </div>
  );
}
