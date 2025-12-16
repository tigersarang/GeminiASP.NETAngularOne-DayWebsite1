using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BlogServer.Dtos;
using BlogServer.Models;
using BlogServer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlogServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly IBlogService _blogService;

        public PostsController(IBlogService blogService)
        {
            _blogService = blogService;
        }

        // [수정] categoryId 파라미터 받기 (FromQuery)
        [HttpGet]
        public async Task<IActionResult> GetPosts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int? categoryId = null)
        {
            var result = await _blogService.GetPostsAsync(page, pageSize, categoryId);
            return Ok(result);
        }

        // GET: api/posts/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPost(int id)
        {
            var post = await _blogService.GetPostByIdAsync(id);
            if (post == null) return NotFound();
            return Ok(post);
        }

        // POST: api/posts
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreatePost([FromForm] CreatePostDto postDto) // [FromForm] 중요!
        {
            var post = new BlogPost
            {
                Title = postDto.Title,
                Content = postDto.Content,
                Category = postDto.Category,
                Author = postDto.Author,
                CreatedAt = DateTime.UtcNow
            };

            // 파일이 있다면 저장 로직 수행
            if (postDto.File != null && postDto.File.Length > 0)
            {
                // 저장할 폴더 경로 (wwwroot/uploads)
                var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

                // 폴더가 없으면 생성
                if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

                // 파일명 중복 방지를 위해 GUID 사용
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(postDto.File.FileName);
                var filePath = Path.Combine(uploadPath, fileName);

                // 파일 저장
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await postDto.File.CopyToAsync(stream);
                }

                // DB에 저장할 정보 설정
                post.AttachmentName = postDto.File.FileName; // 원본 이름 (예: report.pdf)
                post.AttachmentPath = fileName;              // 저장된 이름 (예: guid.pdf)
            }

            var createdPost = await _blogService.CreatePostAsync(post);
            return CreatedAtAction(nameof(GetPost), new { id = createdPost.Id }, createdPost);
        }

        [HttpGet("download/{id}")]
        public async Task<IActionResult> DownloadFile(int id)
        {
            var post = await _blogService.GetPostByIdAsync(id);
            if (post == null || string.IsNullOrEmpty(post.AttachmentPath))
            {
                return NotFound("File not found.");
            }

            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", post.AttachmentPath);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("Physical file not found.");
            }

            // 파일 바이트 읽기
            var memory = new MemoryStream();
            using (var stream = new FileStream(filePath, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;

            // MIME 타입 추론 (간단하게 application/octet-stream)
            var contentType = "application/octet-stream";

            // 파일 다운로드 실행
            return File(memory, contentType, post.AttachmentName);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // 관리자만 삭제 가능하도록 설정
        public async Task<IActionResult> DeletePost(int id)
        {
            var post = await _blogService.GetPostByIdAsync(id);
            if (post == null)
            {
                return NotFound();
            }

            // 1. 파일 삭제 로직
            if (!string.IsNullOrEmpty(post.AttachmentPath))
            {
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", post.AttachmentPath);

                // 실제 파일이 존재하면 삭제
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            // 2. DB 데이터 삭제
            // IBlogService에 Delete 메서드가 없으므로 아래에서 추가해야 함.
            // 여기서는 편의상 _context를 직접 사용하거나 Service에 추가했다고 가정
            // (Service 패턴을 유지하기 위해 Service 수정 먼저 진행하겠습니다.)
            await _blogService.DeletePostAsync(id);

            return NoContent(); // 204 No Content (성공적으로 삭제됨)
        }
    }
}