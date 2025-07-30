// Test script for n8n webhook integration
const testN8nWebhook = async () => {
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/resume-tailor';
  
  const testData = {
    resume: `JOHN DOE
Software Engineer
john.doe@email.com | (555) 123-4567 | linkedin.com/in/johndoe

EXPERIENCE
Software Engineer | Tech Corp | 2020-2023
- Developed web applications using React and Node.js
- Collaborated with cross-functional teams
- Implemented CI/CD pipelines

EDUCATION
Bachelor of Science in Computer Science | University of Tech | 2020`,
    
    jobDescription: {
      title: "Senior Frontend Developer",
      company: "Innovation Labs",
      description: "We're looking for a Senior Frontend Developer to join our team and help build amazing user experiences.",
      requirements: ["React", "TypeScript", "5+ years experience", "Team leadership"],
      preferences: ["Vue.js", "GraphQL", "Agile methodology"]
    }
  };

  try {
    console.log('Testing n8n webhook...');
    console.log('URL:', n8nWebhookUrl);
    console.log('Sending test data...');
    
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Success! n8n response:');
      console.log('Match Score:', result.matchScore);
      console.log('Tailored Resume Length:', result.tailoredResume?.length);
      console.log('Suggested Changes:', result.suggestedChanges?.length);
      console.log('\nFirst 500 chars of tailored resume:');
      console.log(result.tailoredResume?.substring(0, 500) + '...');
    } else {
      console.error('❌ Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
};

// Run the test
testN8nWebhook(); 