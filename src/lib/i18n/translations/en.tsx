import React from 'react';
import type { Translation } from '../types';

export const en: Translation = {
  nav: {
    solutions: 'Solutions',
    process: 'Process',
    aiDev: 'AI Development',
    core: 'Core',
    work: 'Work',
    technology: 'Technology',
    contactBtn: 'Contact →',
  },
  hero: {
    eyebrow: 'AI-native software studio',
    titleLine1: 'From spreadsheet',
    titleLine2: 'to software.',
    lead: 'FLOWBASE builds business software, internal tools, and workflow automation for modern companies moving beyond Excel.',
    startProjectBtn: 'Start a project',
    viewWorkBtn: 'View our work',
    stat1: 'steps from workflow to production',
    stat2: 'reusable modules in FLOWBASE Core',
    stat3: 'business system templates',
    pipeline: 'flowbase / pipeline',
    mapping: 'mapping → validating → building',
    overview: 'Operations overview',
    demoData: 'demo data',
    records: 'Records',
    pending: 'Pending',
    approved: 'Approved',
  },
  problem: {
    eyebrow: '02 — The problem',
    title: (
      <>
        Your business already has a system.
        <br />
        It just isn&apos;t software yet.
      </>
    ),
    lead: 'Many businesses run on spreadsheets, emails, and manual work. FLOWBASE turns those workflows into centralized software.',
    cards: {
      spreadsheets: {
        title: 'Too many spreadsheets',
        desc: 'Data is scattered across multiple files, with each department holding a different version.',
      },
      dataEntry: {
        title: 'Repeated data entry',
        desc: 'The same information has to be re-entered multiple times in different places.',
      },
      workflows: {
        title: 'Manual workflows',
        desc: 'Processes depend heavily on human intervention and a few key personnel.',
      },
      sourceOfTruth: {
        title: 'No single source of truth',
        desc: 'There is no centralized place to track data and processing status.',
      },
      reporting: {
        title: 'Slow reporting',
        desc: 'Consolidating reports takes too much time and is often delayed for decision-making.',
      },
    },
    conclusion: {
      title: 'Your workflow already exists.',
      desc: 'What remains is bringing it into a unified system with shared data, clear permissions, and automated approvals.',
    },
  },
  solutions: {
    eyebrow: '03 — What we build',
    title: 'Software built around your workflow.',
    lead: 'We don\'t sell one-size-fits-all software. Systems are designed around exactly how your business operates.',
    cards: {
      businessMsg: {
        title: 'Business Management',
        desc: 'HR, training, operations, and profile management in a single system.',
      },
      workflow: {
        title: 'Workflow & Approval',
        desc: 'Submit → Review → Approve → Complete, with full history and permissions.',
      },
      data: {
        title: 'Data & Dashboard',
        desc: 'Centralized data, real-time reporting, and analytics.',
      },
      excel: {
        title: 'Excel Automation',
        desc: 'Import → Validate → Process → Export, keeping familiar files when needed.',
      },
      internalTools: {
        title: 'Internal Tools',
        desc: 'Internal tools built specifically for your process, not forcing your process to fit the software.',
      },
      ai: {
        title: 'AI-assisted Software',
        desc: 'AI-native development shortens the development lifecycle and feedback loop.',
      },
    },
    explore: 'Explore →',
  },
  process: {
    eyebrow: '04 — How we build',
    title: 'From business problem to working software.',
    lead: 'Six steps, each with clear deliverables so you always know where your project stands.',
    steps: {
      discover: {
        title: 'Discover',
        desc: 'Understand how the business operates, who does what, and where data flows.',
      },
      map: {
        title: 'Map',
        desc: 'Translate the actual process into deployable workflows and data models.',
      },
      prototype: {
        title: 'Prototype',
        desc: 'Build a visual prototype for approval before developing the entire system.',
      },
      build: {
        title: 'Build',
        desc: 'AI-assisted development combined with engineering review on every pull request.',
      },
      test: {
        title: 'Test',
        desc: 'Verify business logic, permissions, data, and the entire approval flow.',
      },
      deploy: {
        title: 'Deploy',
        desc: 'Ship the system to production, hand over documentation, and guide operations.',
      },
    },
  },
  aiNative: {
    eyebrow: '05 — AI-native development',
    title: (
      <>
        AI accelerates development.
        <br />
        Humans make the decisions.
      </>
    ),
    lead: 'FLOWBASE leverages AI as an active engineering partner in analysis, coding, testing, and documentation. Every production change is reviewed by senior engineers.',
  },
  core: {
    eyebrow: '06 — FLOWBASE Core',
    title: 'We don\'t build everything from scratch.',
    lead: 'FLOWBASE Core is our reusable foundation that lets us build business systems faster and with consistent quality. Pick a domain to see what adapts and what stays solid.',
  },
  work: {
    eyebrow: '07 — Work & demos',
    title: 'Built for real business workflows.',
    lead: 'The systems below are interactive prototypes built by FLOWBASE to showcase our capabilities and architecture.',
    note: 'These are demos and concepts built entirely by FLOWBASE, not deployed client projects. Displayed data is sample data. We do not post client logos, testimonials, or unverified business metrics.',
    exploreBtn: 'Explore →',
  },
  caseStudy: {
    eyebrow: '08 — Case study · Concept',
    title: 'Lecturer Management',
    lead: 'A comprehensive example of how FLOWBASE transforms spreadsheet-driven operations into unified software.',
    flow: {
      problem: { title: 'Problem', desc: 'Lecturer information is scattered across multiple spreadsheets and separate documents.' },
      existing: { title: 'Existing workflow', desc: 'Excel files, paper contracts, teaching hour tables, and payment files are disconnected.' },
      solution: { title: 'FLOWBASE solution', desc: 'A single lecturer profile where all related data is attached.' },
      system: { title: 'System', desc: 'Dashboard, profiles, teaching assignments, and payments within the same system.' },
      result: { title: 'Result', desc: 'Design goal: enter once, approve via workflow, report automatically.' },
    },
    existingTitle: 'Existing workflow',
    existingDesc: 'Five data sources, none of which can communicate with the others.',
    solutionTitle: 'FLOWBASE solution',
    solutionDesc: 'A central entity with all operations attached to it.',
    shots: {
      dashboard: { title: 'Dashboard', desc: 'Overview of lecturer count, contracts, and profiles pending approval.' },
      profile: { title: 'Lecturer profile', desc: 'A single profile containing information, contracts, and attached documents.' },
      assignment: { title: 'Teaching assignment', desc: 'Assignments by class and semester, automatically accumulating teaching hours.' },
      payment: { title: 'Payment', desc: 'Calculates payments from approved hours and exports reconciliation tables to Excel.' },
    },
  },
  technology: {
    eyebrow: '09 — Technology',
    title: 'Built with modern technology.',
  },
  contact: {
    eyebrow: '10 — Contact',
    title: 'Have a process worth improving?',
    lead: 'Send us your current workflow. We will explore how to turn it into modern software.',
    responseLabel: 'Response',
    responseValue: 'within 1–2 business days',
    noCommitment: 'No commitment. Just a conversation.',
    form: {
      name: 'Full Name',
      namePlaceholder: 'John Doe',
      company: 'Company',
      companyPlaceholder: 'Company Name',
      emailPlaceholder: 'you@company.com',
      message: 'What are you trying to improve?',
      messagePlaceholder: 'Describe your process...',
      submitBtn: 'Send message',
      sendingBtn: 'Sending...',
      delivered: 'Your message has been sent successfully!',
      errorEmpty: 'Please fill in your name, email, and describe your process so we can understand the problem.',
    },
  },
  footer: {
    titleLine1: 'From spreadsheet',
    titleLine2: 'to software.',
    subtitle: 'Build better workflows. Build better software.',
    siteLabel: 'SITE',
    contactLabel: 'CONTACT',
    copyright: '© 2026 FLOWBASE',
    tagline: 'From Spreadsheet to Software.',
  },
};
