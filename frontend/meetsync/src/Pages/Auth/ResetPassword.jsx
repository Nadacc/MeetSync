import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../../features/authSlice";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import Button from "../../components/ui/Button";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  otp: yup.string().required("OTP is required"),
  newPassword: yup
    .string()
    .min(6, "Minimum 6 characters")
    .required("Password is required"),
});

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || "";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: emailFromState,
    },
  });

  const onSubmit = (data) => {
    dispatch(resetPassword(data))
      .unwrap()
      .then(() => {
        navigate("/login");
      })
      .catch((err) => {
        console.error("Reset failed:", err);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-6"
        noValidate
      >
        <h2 className="text-2xl font-semibold text-center">Reset Password</h2>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            defaultValue={emailFromState}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* OTP */}
        <div className="space-y-2">
          <Label htmlFor="otp">OTP</Label>
          <Input id="otp" {...register("otp")} />
          {errors.otp && (
            <p className="text-red-500 text-sm">{errors.otp.message}</p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full cursor-pointer">
          Reset Password
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
