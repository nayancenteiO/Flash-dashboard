import AILensDashboard from '../components/AILensDashboard'; // The Client Component

export default function Home() {
  return (
    <div>
      <h1>AI Lens Dashboard</h1>
      {/* Rendering the Client Component inside the Server Component */}
      <AILensDashboard />
    </div>
  );
}