'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  question: string;
  answer: string;
  options: Option[];
  createdAt: string;
}

export default function QuestionsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const isTeacher = localStorage.getItem(`teacher-status-${userId}`);
    if (isTeacher !== 'true') {
      router.push('/');
    }
  }, [userId, router]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/questions');
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setQuestions(data);
        } else {
          setError('Failed to load questions');
        }
      } catch (err) {
        setError('Error fetching questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete');
      } else {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (err) {
      alert('Error deleting question');
    }
  };

  const filteredQuestions = questions.filter((q) =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">All Questions</h1>
        <Link
          href="/questions/create"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Create Question
        </Link>
      </div>

      <input
        type="text"
        placeholder="Search questions..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="w-full border px-3 py-2 rounded mb-6"
      />

      {loading ? (
        <p>Loading questions...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : filteredQuestions.length === 0 ? (
        <p>No matching questions found.</p>
      ) : (
        <>
          <ul className="space-y-6">
            {paginatedQuestions.map((q) => (
              <li key={q.id} className="border rounded-lg p-4 shadow-sm">
                <h2 className="text-lg font-semibold">{q.question}</h2>
                <p className="text-sm text-green-700 mt-1">
                  Answer: {q.answer}
                </p>
                <ul className="mt-2 list-disc list-inside">
                  {q.options.map((opt) => (
                    <li key={opt.id} className="text-gray-700">
                      {opt.text}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-x-2">
                  <Link
                    href={`/questions/${q.id}/edit`}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-center items-center space-x-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
