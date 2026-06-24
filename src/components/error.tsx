import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangleIcon } from "lucide-react";

interface ErrorCardProps {
  title: string;
  message: string;
}

export function ErrorCard({ title, message }: ErrorCardProps) {
  return (
    // Outer wrapper adds the left-border accent stripe via a colored left border
    <div className="flex h-full justify-center items-center">
      <Card className="border bg-red-300 border-red-700 text-red-700 opacity-90">
        <CardHeader>
          <div className="flex items-center text-2xl gap-3">
            <AlertTriangleIcon className="h-8 w-8 text-red-700" />
            <CardTitle>{title}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="text-sm">{message}</CardContent>
      </Card>
    </div>
  );
}
