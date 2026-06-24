import { Entry } from "@/types/entry";
import { mood, sleep } from "./metric";

export const entry: Entry = {
  id: 123,
  userId: "user_456",
  comment: "",
  recordedAt: new Date(),
  creationTimestamp: new Date(),
  updatedTimestamp: new Date(),
  values: []
};
