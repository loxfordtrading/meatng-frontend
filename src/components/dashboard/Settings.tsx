import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Settings = () => {

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword({
      ...password,
      [e.target.name]: e.target.value,
    });
  };

  const togglePassword = (field: "current" | "new" | "confirm") => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
  };

  const handleSaveSettings = () => {
    console.log(profile);
  };

  const handleChangePassword = () => {
    if (password.new !== password.confirm) {
      setPasswordError("Passwords do not match");
      setPasswordSuccess("");
      return;
    }

    setPasswordError("");
    setPasswordSuccess("Password updated successfully");
  };

  return (
    <div className="space-y-6 animate-fade-in admin-page-bg rounded-3xl p-4 sm:p-5">

      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">
          Account Settings
        </h2>
        <p className="text-muted-foreground mt-1">
          Update your personal information and preferences.
        </p>
      </div>

      {/* PERSONAL INFO */}
      <Card className="admin-card">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                name="first_name"
                value={profile.first_name}
                onChange={handleProfileChange}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                name="last_name"
                value={profile.last_name}
                onChange={handleProfileChange}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                name="email"
                value={profile.email}
                readOnly
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                placeholder="+234..."
                className="h-11 rounded-xl"
              />
            </div>

          </div>

          <Button size="sm" onClick={handleSaveSettings}>
            Save Changes
          </Button>

        </CardContent>
      </Card>

      {/* PASSWORD */}
      <Card className="admin-card">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* CURRENT PASSWORD */}
            <div className="space-y-2 relative">
              <Label>Current Password</Label>
              <Input
                type={showPassword.current ? "text" : "password"}
                name="current"
                value={password.current}
                onChange={handlePasswordChange}
                className="h-11 rounded-xl pr-10"
              />

              <button
                type="button"
                onClick={() => togglePassword("current")}
                className="absolute right-3 top-[38px] text-muted-foreground"
              >
                {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* NEW PASSWORD */}
            <div className="space-y-2 relative">
              <Label>New Password</Label>
              <Input
                type={showPassword.new ? "text" : "password"}
                name="new"
                value={password.new}
                onChange={handlePasswordChange}
                className="h-11 rounded-xl pr-10"
              />

              <button
                type="button"
                onClick={() => togglePassword("new")}
                className="absolute right-3 top-[38px] text-muted-foreground"
              >
                {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="space-y-2 relative">
              <Label>Confirm Password</Label>
              <Input
                type={showPassword.confirm ? "text" : "password"}
                name="confirm"
                value={password.confirm}
                onChange={handlePasswordChange}
                className="h-11 rounded-xl pr-10"
              />

              <button
                type="button"
                onClick={() => togglePassword("confirm")}
                className="absolute right-3 top-[38px] text-muted-foreground"
              >
                {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

          </div>

          {passwordError && (
            <p className="text-sm text-destructive">{passwordError}</p>
          )}

          {passwordSuccess && (
            <p className="text-sm text-emerald-600">{passwordSuccess}</p>
          )}

          <Button size="sm" variant="outline" onClick={handleChangePassword}>
            Update Password
          </Button>

        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;