import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
}

interface Post {
  id: number;
  userId: string;
  content: string;
}

interface Comment {
  id: number;
  postId: number;
  content: string;
}

const ToppUsers = () => {
  const [topUsers, setTopUsers] = useState<{ name: string; commentCount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // Paste your full token here

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await axios.get<User[]>(
          'http://20.244.56.144/evaluation-service/users',
          { headers }
        );

        const users = usersRes.data;

        const usersWithComments = await Promise.all(
          users.map(async (user) => {
            try {
              const postsRes = await axios.get<Post[]>(
                `http://20.244.56.144/evaluation-service/users/${user.id}/posts`,
                { headers }
              );

              const posts = postsRes.data;

              const totalComments = await Promise.all(
                posts.map(async (post) => {
                  try {
                    const commentsRes = await axios.get<Comment[]>(
                      `http://20.244.56.144/evaluation-service/posts/${post.id}/comments`,
                      { headers }
                    );
                    return commentsRes.data.length;
                  } catch {
                    return 0;
                  }
                })
              );

              const sum = totalComments.reduce((acc, count) => acc + count, 0);
              return { name: user.name, commentCount: sum };
            } catch (err) {
              console.error(`Error processing posts for user ${user.name}`, err);
              return { name: user.name, commentCount: 0 };
            }
          })
        );

        const sorted = usersWithComments.sort((a, b) => b.commentCount - a.commentCount);
        setTopUsers(sorted.slice(0, 5));
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Top 5 Users by Most Commented Posts</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : topUsers.length === 0 ? (
        <p>No data found.</p>
      ) : (
        <ul>
          {topUsers.map((user, index) => (
            <li key={index}>
              <strong>{index + 1}. {user.name}</strong> — {user.commentCount} comments
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ToppUsers;
