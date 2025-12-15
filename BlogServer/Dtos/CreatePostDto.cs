using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace BlogServer.Dtos
{
public class CreatePostDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        [Required]
        public string Category { get; set; } = string.Empty; // 현재 DB 구조상 이름으로 저장
        
        // 작성자는 나중에 JWT에서 추출하므로 지금은 클라이언트가 보내거나 서버가 임시 설정
        public string Author { get; set; } = "DevMaster"; 
    }
}