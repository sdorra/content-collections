type Props = {
  children: React.ReactNode;
};

export function Internship({ children }: Props) {
  return (
    <div style={{ border: "2px dashed red", padding: "1rem", marginTop: "2rem", borderRadius: "1rem" }}>
      <h2 style={{marginTop: "0"}}>Internship at ContentCrafter Inc.</h2>
      <p>
        Are you creative and passionate about writing? ContentCrafter Inc. is
        looking for motivated interns to support our team!
      </p>
      <p>Interested? Send your application to contact@contentcrafter.com.</p>
    </div>
  );
}
