import { Button } from "payload/components/elements";
import { useDocumentInfo } from "payload/components/utilities";
import React from "react";
import { toast } from "react-toastify";
import "./ActionButton.css"

export type PostActionButtonProps = {
  title: string;
  postUrl: string;
};

const PostActionButton: React.FC<PostActionButtonProps> = ({ title, postUrl }) => {
  const document = useDocumentInfo();

  async function post() {
    if (document.id) postUrl = postUrl.replace(":id", document.id.toString());

    let response = await fetch(postUrl, {
      method: "POST",
    });

    var json: any | undefined;
    try {
      json = await response.json();
    } catch {
      json = undefined;
    }

    if (response.status == 200) {
      toast.success(json?.message ?? "This action completed successfully!");
    } else {
      toast.error(json?.error ?? "There was an error completing this request.");
    }
  }

  return <Button className="action-button" onClick={post}>{title}</Button>;
};

export default PostActionButton;

export function createPostActionButton(props: PostActionButtonProps): React.FC {
  return ({}) => {
    return <PostActionButton {...props} />;
  };
}