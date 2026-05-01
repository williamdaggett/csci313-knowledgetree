import { Timestamp } from 'firebase/firestore';

export interface TreeDescription {
  id: string;
  tree_id: string; //actual tree data. I'm thinking these could probably be stored separate for simplicity when working with angular diagram
  name: string;
  description: string;
  date_created: Timestamp; //how firestore handles dates. Has method toDate() when you need to display it.
  authorId: string;
}
