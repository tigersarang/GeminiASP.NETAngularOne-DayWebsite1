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
            // DB가 없으면 생성
            context.Database.EnsureCreated();

            // 1. 카테고리가 비어있으면 데이터 시딩
            if (!context.Categories.Any())
            {
                // [1] 부모 카테고리 생성 및 저장
                var csharp = new Category { Name = "C#" };
                var angular = new Category { Name = "Angular" };
                var backend = new Category { Name = "Backend" };

                context.Categories.AddRange(csharp, angular, backend);
                context.SaveChanges(); // ID 생성을 위해 먼저 저장

                // [2] 자식 카테고리 생성 (ParentId 연결)
                var subCategories = new Category[]
                {
                    // C# 하위
                    new Category { Name = "ASP.NET Core", ParentId = csharp.Id },
                    new Category { Name = "WPF", ParentId = csharp.Id },
                    new Category { Name = "Blazor", ParentId = csharp.Id },

                    // Angular 하위
                    new Category { Name = "Components", ParentId = angular.Id },
                    new Category { Name = "RxJS", ParentId = angular.Id },
                    new Category { Name = "State Management", ParentId = angular.Id },

                    // Backend 하위
                    new Category { Name = "Database", ParentId = backend.Id },
                    new Category { Name = "Docker", ParentId = backend.Id }
                };

                context.Categories.AddRange(subCategories);
                context.SaveChanges();
            }

            // 2. 관리자 계정 시딩 (기존 코드 유지)
            if (!context.Users.Any(u => u.Role == "Admin"))
            {
                var adminUser = new User
                {
                    Username = "Admin",
                    Email = "admin@blog.com",
                    Role = "Admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123")
                };
                context.Users.Add(adminUser);
                context.SaveChanges();
            }
        }
    }
}