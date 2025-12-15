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
        public async Task<IActionResult> CreatePost([FromBody] CreatePostDto postDto)
        {
            // DTO -> Entity 변환
            var post = new BlogPost
            {
                Title = postDto.Title,
                Content = postDto.Content,
                Category = postDto.Category,
                Author = postDto.Author, // 클라이언트가 안 보내면 기본값
                CreatedAt = DateTime.UtcNow
            };

            var createdPost = await _blogService.CreatePostAsync(post);

            // 생성된 리소스의 위치(Location Header)와 데이터를 반환
            return CreatedAtAction(nameof(GetPost), new { id = createdPost.Id }, createdPost);
        }
    }
}