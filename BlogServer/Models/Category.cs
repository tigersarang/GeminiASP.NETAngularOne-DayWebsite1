using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace BlogServer.Models
{
public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        // [추가] 부모 카테고리 ID (Nullable: 최상위 카테고리는 null)
        public int? ParentId { get; set; }

        // [옵션] 부모-자식 탐색용 (EF Core 관계 설정)
        [JsonIgnore] // API 응답 시 무한 루프 방지
        public Category? Parent { get; set; }
        
        [JsonIgnore] 
        public List<Category> SubCategories { get; set; } = new();
    }
}