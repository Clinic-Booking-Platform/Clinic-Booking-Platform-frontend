import React, { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stethoscope, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { LoginRequest } from '@/types/auth'
import { login } from '@/services/auth.api'
import { useAuthStore, type User } from '@/stores'
import { toast } from 'react-toastify'
export const LoginPage: React.FC = () => {
  const { setLogin } = useAuthStore()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: ""
  })
  const [, setLoading] = useState(false);
  const onLogin = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = (await login(formData)) as {
        data?: { access_token?: string; user?: User }
        access_token?: string
        user?: User
      };
      const authData = res?.data || res;
      const accessToken = authData?.access_token;
      const user = authData?.user;

      if (accessToken && user) {
        setLogin(user, accessToken);
        toast.success("Đăng nhập thành công");
        navigate('/admin/dashboard');
      } else {
        toast.error("Không nhận được dữ liệu xác thực từ máy chủ!");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string | string[] } }; message?: string };
      const errorMsg =
        err?.response?.data?.message || err?.message || "Đã xảy ra lỗi, vui lòng thử lại!";
      console.log(errorMsg, "errorMsg");

      // 2. Kiểm tra nếu là mảng thì lặp qua từng phần tử
      if (Array.isArray(errorMsg)) {
        errorMsg.forEach((item: string) => {
          toast.error(item);
        });
      } else {
        // 3. Nếu là chuỗi đơn lẻ thì hiển thị luôn
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border/80 p-6 sm:p-8 shadow-lg">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-md shadow-teal-500/25">
            <Stethoscope className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              MediCare Clinic Portal
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cổng đăng nhập dành cho Quản trị viên & Bác sĩ
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Email quản trị</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="email"
                onChange={onLogin}
                name='email'
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Mật khẩu</label>
              {/* <a href="#" className="text-xs text-teal-600 hover:underline">Quên mật khẩu?</a> */}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="password"
                onChange={onLogin}
                name='password'
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-10 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm gap-2">
            <span>Đăng nhập hệ thống</span>
            <ArrowRight className="size-4" />
          </Button>
        </form>

        {/* Lưu ý phân quyền tài khoản quản trị */}
        <div className="mt-4 text-center text-xs text-muted-foreground">
          Tài khoản quản trị được cấp và phân quyền bởi Ban Giám Đốc.
        </div>

        <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-600" />
          <span>Hệ thống bảo mật 2 lớp SSL & Audit Log</span>
        </div>
      </div>
    </div>
  )
}
