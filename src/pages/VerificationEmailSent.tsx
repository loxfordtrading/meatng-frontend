import { useSearchParams } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

const VerificationEmailSent = () => {
    
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const openEmailInbox = () => {
    if (!email) return;

    const domain = email.split("@")[1];

    if (domain.includes("gmail")) {
      window.open("https://mail.google.com", "_blank");
    } 
    else if (domain.includes("yahoo")) {
      window.open("https://mail.yahoo.com", "_blank");
    } 
    else if (domain.includes("outlook") || domain.includes("hotmail")) {
      window.open("https://outlook.live.com", "_blank");
    } 
    else {
      window.open("https://mail.google.com", "_blank");
    }
  };

  return (
    <div className="w-full flex justify-center items-center h-[92vh] p-4">
      <div className="flex flex-col items-center justify-center space-y-2">
        <FaEnvelope size={100} />

        <h2 className="font-bold mx-auto text-2xl text-center">
          A verification email has been sent to {email}
        </h2>

        <h2 className="font-medium mx-auto text-center text-gray-600">
          Open your email inbox and click the link to verify your email
        </h2>

        <Button onClick={openEmailInbox}>
          Open Email
        </Button>
      </div>
    </div>
  );
};

export default VerificationEmailSent;