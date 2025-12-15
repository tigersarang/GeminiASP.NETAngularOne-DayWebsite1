using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BlogServer.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogServer.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<BlogPost> BlogPosts { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<User> Users { get; set; }
    }
}