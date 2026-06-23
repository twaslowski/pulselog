import { MessageSquareTextIcon } from "lucide-react";
import { Root, Trigger, Content } from "@radix-ui/react-hover-card";
import { Badge } from "@/components/ui/badge";

export function EntryComment({ comment }: { comment: string }) {
  return (
    <Badge variant="secondary" className="cursor-pointer">
      <Root openDelay={0}>
        <Trigger>
          <MessageSquareTextIcon className="opacity-80 size-5" />
        </Trigger>
        <Content>{comment}</Content>
      </Root>
    </Badge>
  );
}
