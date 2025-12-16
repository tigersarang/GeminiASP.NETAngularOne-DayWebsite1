export interface Category {
  id: number;
  name: string;
  parentId?: number | null; // [추가]

  // [UI용] 프론트에서 트리 구조 만들 때 사용할 필드
  children?: Category[];
}
