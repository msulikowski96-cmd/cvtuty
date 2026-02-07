import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";
const pdf = require("pdf-parse");

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // New endpoint to parse PDF
  app.post("/api/pdf/parse", async (req, res) => {
    try {
      const { base64 } = req.body;
      if (!base64) {
        return res.status(400).json({ error: "Base64 data is required" });
      }

      const buffer = Buffer.from(base64, "base64");
      const data = await pdf(buffer);
      
      res.json({ text: data.text });
    } catch (error) {
      console.error("PDF parse error:", error);
      res.status(500).json({ error: "Failed to parse PDF" });
    }
  });

  app.post("/api/cv/optimize", async (req, res) => {
    try {
      const { cvText, jobDescription } = req.body;
      if (!cvText || !jobDescription) {
        return res.status(400).json({ error: "CV text and job description are required" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert CV/resume optimizer. Your task is to rewrite and optimize the provided CV to better match the job description. 
            
Rules:
- Keep all factual information accurate - do not invent experience or skills
- Reorganize and rewrite bullet points to highlight relevant experience
- Use action verbs and quantifiable achievements
- Optimize keywords to match the job description
- Maintain professional tone
- Format the output as a clean, well-structured CV
- Use markdown formatting for headers and sections
- Write in the same language as the original CV`,
          },
          {
            role: "user",
            content: `Here is my CV:\n\n${cvText}\n\nHere is the job description I'm applying for:\n\n${jobDescription}\n\nPlease optimize my CV for this position.`,
          },
        ],
        stream: true,
        max_completion_tokens: 4096,
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("CV optimize error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to optimize CV" });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Processing failed" })}\n\n`);
        res.end();
      }
    }
  });

  app.post("/api/cv/audit", async (req, res) => {
    try {
      const { cvText } = req.body;
      if (!cvText) {
        return res.status(400).json({ error: "CV text is required" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert ATS (Applicant Tracking System) analyst and CV reviewer. Analyze the provided CV and provide a detailed audit.

You must respond with valid JSON in this exact format:
{
  "score": <number 0-100>,
  "summary": "<brief overall assessment>",
  "categories": [
    {
      "name": "<category name>",
      "score": <number 0-100>,
      "icon": "<one of: format, content, keywords, impact, readability>",
      "findings": ["<finding 1>", "<finding 2>"]
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "atsIssues": ["<issue 1>", "<issue 2>"]
}

Categories to evaluate:
1. Format & Structure (formatting, layout, sections)
2. Content Quality (achievements, descriptions, relevance)
3. Keywords & SEO (industry keywords, action verbs)
4. Impact & Metrics (quantifiable achievements, results)
5. ATS Readability (parsing compatibility, file format issues)

Write analysis in the same language as the CV.`,
          },
          {
            role: "user",
            content: `Please audit this CV:\n\n${cvText}`,
          },
        ],
        stream: true,
        max_completion_tokens: 4096,
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("CV audit error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to audit CV" });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Processing failed" })}\n\n`);
        res.end();
      }
    }
  });

  app.post("/api/cover-letter/generate", async (req, res) => {
    try {
      const { cvText, jobDescription } = req.body;
      if (!cvText || !jobDescription) {
        return res.status(400).json({ error: "CV text and job description are required" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert cover letter writer. Create a compelling, personalized cover letter based on the candidate's CV and the job description.

Rules:
- Make it personal and specific to the role
- Highlight the most relevant experience and skills
- Show enthusiasm for the company and role
- Keep it concise (3-4 paragraphs)
- Use professional but engaging tone
- Reference specific requirements from the job description
- Use markdown formatting
- Write in the same language as the CV and job description`,
          },
          {
            role: "user",
            content: `Here is my CV:\n\n${cvText}\n\nHere is the job description:\n\n${jobDescription}\n\nPlease write a cover letter for this position.`,
          },
        ],
        stream: true,
        max_completion_tokens: 2048,
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Cover letter error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to generate cover letter" });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Processing failed" })}\n\n`);
        res.end();
      }
    }
  });

  app.post("/api/interview/simulate", async (req, res) => {
    try {
      const { cvText, jobDescription } = req.body;
      if (!cvText || !jobDescription) {
        return res.status(400).json({ error: "CV text and job description are required" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert recruiter and interview coach. Generate interview questions with suggested answers based on the candidate's CV and the job they're applying for.

You must respond with valid JSON in this exact format:
{
  "questions": [
    {
      "question": "<interview question>",
      "category": "<one of: behavioral, technical, situational, general>",
      "difficulty": "<one of: easy, medium, hard>",
      "suggestedAnswer": "<detailed suggested answer>",
      "tips": ["<tip 1>", "<tip 2>"]
    }
  ]
}

Generate 8-10 questions covering:
- 2-3 behavioral questions (STAR method)
- 2-3 technical/role-specific questions
- 2 situational questions
- 1-2 general questions (motivation, career goals)

Write in the same language as the CV and job description.`,
          },
          {
            role: "user",
            content: `Here is my CV:\n\n${cvText}\n\nHere is the job description:\n\n${jobDescription}\n\nPlease generate interview questions and suggested answers.`,
          },
        ],
        stream: true,
        max_completion_tokens: 4096,
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Interview simulate error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to simulate interview" });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Processing failed" })}\n\n`);
        res.end();
      }
    }
  });

  app.post("/api/skills/analyze", async (req, res) => {
    try {
      const { cvText, jobDescription } = req.body;
      if (!cvText || !jobDescription) {
        return res.status(400).json({ error: "CV text and job description are required" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert career advisor specializing in skills gap analysis. Compare the candidate's skills from their CV with the requirements in the job description.

You must respond with valid JSON in this exact format:
{
  "matchScore": <number 0-100>,
  "summary": "<brief assessment of overall fit>",
  "matchedSkills": [
    {
      "skill": "<skill name>",
      "level": "<one of: strong, moderate, basic>",
      "evidence": "<where this appears in the CV>"
    }
  ],
  "missingSkills": [
    {
      "skill": "<required skill not found>",
      "importance": "<one of: critical, important, nice-to-have>",
      "recommendation": "<how to acquire this skill>"
    }
  ],
  "recommendations": [
    {
      "action": "<recommended action>",
      "timeframe": "<estimated time>",
      "resources": ["<resource 1>", "<resource 2>"]
    }
  ]
}

Write in the same language as the CV and job description.`,
          },
          {
            role: "user",
            content: `Here is my CV:\n\n${cvText}\n\nHere is the job description:\n\n${jobDescription}\n\nPlease analyze the skills gap.`,
          },
        ],
        stream: true,
        max_completion_tokens: 4096,
      });

      let fullResponse = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Skills analyze error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to analyze skills" });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Processing failed" })}\n\n`);
        res.end();
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
