using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BlogServer.Data;
using BlogServer.Dtos;
using BlogServer.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace BlogServer.Services
{
    public interface IBlogService
    {
        // [수정] int? categoryId 추가
        Task<PagedResult<BlogPost>> GetPostsAsync(int page, int pageSize, int? categoryId = null);
        Task<BlogPost> CreatePostAsync(BlogPost post);
        Task<BlogPost?> GetPostByIdAsync(int id);
        Task DeletePostAsync(int id);
    }

    public class BlogService : IBlogService
    {
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;
        private const string CacheKeyTotalCount = "BlogTotalCount";

        public BlogService(AppDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        // [수정] categoryId 파라미터 추가
        public async Task<PagedResult<BlogPost>> GetPostsAsync(int page, int pageSize, int? categoryId = null)
        {
            // 쿼리 빌더 시작
            var query = _context.BlogPosts.AsQueryable();

            // 1. 카테고리 필터링 로직
            if (categoryId.HasValue)
            {
                // ID로 카테고리 이름을 찾음
                var category = await _context.Categories.FindAsync(categoryId.Value);
                if (category != null)
                {
                    // BlogPost 테이블의 Category 컬럼(문자열)과 비교
                    query = query.Where(p => p.Category == category.Name);
                }
            }

            // 2. TotalCount 계산
            int totalCount;

            if (categoryId.HasValue)
            {
                // 필터링된 경우에는 캐시를 쓰지 않고 실제 개수를 셈
                totalCount = await query.CountAsync();
            }
            else
            {
                // 전체 목록일 때만 캐싱된 개수 사용
                if (!_cache.TryGetValue(CacheKeyTotalCount, out totalCount))
                {
                    totalCount = await _context.BlogPosts.CountAsync();
                    _cache.Set(CacheKeyTotalCount, totalCount, TimeSpan.FromMinutes(5));
                }
            }

            // 3. 페이징 및 데이터 조회
            var items = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<BlogPost>
            {
                Items = items,
                PageNumber = page,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }

        // ... 나머지 메서드는 동일 ...
        public async Task<BlogPost> CreatePostAsync(BlogPost post)
        {
            _context.BlogPosts.Add(post);
            await _context.SaveChangesAsync();
            _cache.Remove(CacheKeyTotalCount);
            return post;
        }

        public async Task<BlogPost?> GetPostByIdAsync(int id)
        {
            return await _context.BlogPosts.FindAsync(id);
        }

        public async Task DeletePostAsync(int id)
        {
            var post = await _context.BlogPosts.FindAsync(id);
            if (post != null)
            {
                _context.BlogPosts.Remove(post);
                await _context.SaveChangesAsync();

                // 캐시 초기화 (TotalCount 등이 바뀌므로)
                _cache.Remove(CacheKeyTotalCount);
            }
        }
    }
}