import { create } from 'zustand';
type Role = 'student' | 'teacher';
interface User {
  name: string;
  email: string;
  role: Role;
}
interface QuestionEvaluation {
  id: number;
  question: string;
  studentAnswer: string;
  modelAnswer: string;
  evaluation: 'Correct' | 'Incorrect' | 'Partial';
  score: string;
  reasoning: string;
}
export interface Evaluation {
  id: string;
  title: string;
  status: 'Processing' | 'Completed' | 'Error';
  score?: number;
  date: string;
  feedbackSummary?: string;
  improvementTips?: string[];
  questions?: QuestionEvaluation[];
  error?: string;
}
interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  evaluations: Evaluation[];
  login: (role: Role) => void;
  logout: () => void;
  switchRole: () => void;
  addEvaluation: (evaluation: Evaluation) => void;
  updateEvaluation: (id: string, data: Partial<Evaluation>) => void;
}
const mockStudentEvaluations: Evaluation[] = [
  {
    id: '1',
    title: 'Physics Mid-term Exam',
    status: 'Completed',
    score: 88,
    date: '2024-07-15',
    feedbackSummary: "Overall, a strong performance. Karthik demonstrates a good grasp of core concepts, especially in kinematics and thermodynamics. The area needing improvement is in wave optics, where some answers lacked detail and precision. The problem-solving approach is logical, but more attention to units and significant figures is recommended.",
    improvementTips: [
      "Review the chapter on wave interference and diffraction, focusing on Young's double-slit experiment.",
      "Practice more numerical problems involving unit conversions to avoid simple calculation errors.",
      "When explaining concepts, try to use precise scientific terminology.",
    ],
    questions: [
      {
        id: 1,
        question: "Explain Newton's First Law of Motion.",
        studentAnswer: "An object in motion stays in motion and an object at rest stays at rest unless a force acts on it.",
        modelAnswer: "Newton's First Law of Motion, also known as the law of inertia, states that an object will remain at rest or in uniform motion in a straight line unless acted upon by an external force.",
        evaluation: "Correct",
        score: "5/5",
        reasoning: "The student correctly captured the essence of the law."
      },
    ]
  },
  { id: '2', title: 'Chemistry Lab Report', status: 'Completed', score: 92, date: '2024-07-10' },
  { id: '3', title: 'Mathematics Assignment 3', status: 'Processing', date: '2024-07-20' },
];
const mockTeacherEvaluations: Evaluation[] = [
  { id: 's1', title: 'Karthik - Physics Mid-term', score: 88, status: 'Completed', date: '2024-07-15' },
  { id: 's2', title: 'Dinesh Kumar - Physics Mid-term', score: 95, status: 'Completed', date: '2024-07-15' },
  { id: 's3', title: 'Ajay - Physics Mid-term', score: 72, status: 'Completed', date: '2024-07-14' },
  { id: 's4', title: 'Kabil - Chemistry Lab Report', status: 'Processing', date: '2024-07-18' },
  { id: 's5', title: 'Shinumon - Physics Mid-term', score: 81, status: 'Completed', date: '2024-07-15' },
  { id: 's6', title: 'Gokul - History Essay', score: 85, status: 'Completed', date: '2024-07-19' },
  { id: 's7', title: 'Arshad - Mathematics Assignment', status: 'Processing', date: '2024-07-20' },
];
const mockTeacherUser: User = {
  name: 'Dr. Sanjeevi',
  email: 'sanjeevi@university.edu',
  role: 'teacher',
};
const mockStudentUser: User = {
  name: 'Karthik',
  email: 'karthik@university.edu',
  role: 'student',
};
export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  user: null,
  evaluations: [],
  login: (role: Role) => set({
    isAuthenticated: true,
    user: role === 'teacher' ? mockTeacherUser : mockStudentUser,
    evaluations: role === 'teacher' ? mockTeacherEvaluations : mockStudentEvaluations,
  }),
  logout: () => set({ isAuthenticated: false, user: null, evaluations: [] }),
  switchRole: () => set((state) => {
    if (!state.user) return {};
    const newRole = state.user.role === 'teacher' ? 'student' : 'teacher';
    return {
      user: newRole === 'teacher' ? mockTeacherUser : mockStudentUser,
      evaluations: newRole === 'teacher' ? mockTeacherEvaluations : mockStudentEvaluations,
    };
  }),
  addEvaluation: (evaluation) => set((state) => ({
    evaluations: [evaluation, ...state.evaluations],
  })),
  updateEvaluation: (id, data) => set((state) => ({
    evaluations: state.evaluations.map((e) =>
      e.id === id ? { ...e, ...data } : e
    ),
  })),
}));