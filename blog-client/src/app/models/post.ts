export interface BlogPost {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  createdAt: string; // C# DateTime은 string으로 넘어옵니다.
  tags?: string[]; // 나중에 확장을 위해 남겨둠
  attachmentName?: string; // 추가
  attachmentPath?: string; // 추가
}
