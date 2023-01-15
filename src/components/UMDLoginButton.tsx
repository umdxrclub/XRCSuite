import React from "react";
import { Button } from "payload/components/elements";

const UMDLoginButton: React.FC = ({ }) => {
  return (
    <div style={{display: "flex", justifyContent: "center"}}>
      <Button>Sign in with UMD</Button>
    </div>
  );
};

export default UMDLoginButton;
