using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BlogServer.Models;

namespace BlogServer.Data
{
    public class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            // 1. DB가 생성되었는지 확인
            context.Database.EnsureCreated();

            // // 2. 카테고리 테이블에 데이터가 이미 있는지 확인 (있으면 아무것도 안 함)
            // if (context.Categories.Any())
            // {
            //     return; // DB has been seeded
            // }

            // // 3. 초기 카테고리 데이터 배열 생성
            // var categories = new Category[]
            // {
            //     new Category { Name = "C#" },
            //     new Category { Name = "Angular" },
            //     new Category { Name = "ASP.NET Core" },
            //     new Category { Name = "Python" },
            //     new Category { Name = "Database" },
            //     new Category { Name = "AI" }
            // };
//            context.Categories.AddRange(categories);

            // 2. [추가] 관리자 계정 시딩
            // 관리자가 한 명도 없으면 기본 관리자 생성
            if (!context.Users.Any(u => u.Role == "Admin"))
            {
                var adminUser = new User
                {
                    Username = "Admin",
                    Email = "admin@blog.com", // 로그인 아이디
                    Role = "Admin",           // [중요] 역할 설정
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123") // 초기 비번
                };
                context.Users.Add(adminUser);
            }

            // 4. DB에 추가 및 저장
            context.SaveChanges();
        }
    }
}