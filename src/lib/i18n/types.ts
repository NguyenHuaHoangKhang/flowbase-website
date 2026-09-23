import React from 'react';

export type Locale = 'vi' | 'en';

export type Translation = {
  nav: {
    solutions: string;
    process: string;
    aiDev: string;
    core: string;
    work: string;
    technology: string;
    contactBtn: string;
  };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    lead: string;
    startProjectBtn: string;
    viewWorkBtn: string;
    stat1: string;
    stat2: string;
    stat3: string;
    pipeline: string;
    mapping: string;
    overview: string;
    demoData: string;
    records: string;
    pending: string;
    approved: string;
  };
  problem: {
    eyebrow: string;
    title: React.ReactNode;
    lead: string;
    cards: {
      spreadsheets: { title: string; desc: string };
      dataEntry: { title: string; desc: string };
      workflows: { title: string; desc: string };
      sourceOfTruth: { title: string; desc: string };
      reporting: { title: string; desc: string };
    };
    conclusion: { title: string; desc: string };
  };
  solutions: {
    eyebrow: string;
    title: string;
    lead: string;
    cards: {
      businessMsg: { title: string; desc: string };
      workflow: { title: string; desc: string };
      data: { title: string; desc: string };
      excel: { title: string; desc: string };
      internalTools: { title: string; desc: string };
      ai: { title: string; desc: string };
    };
    explore: string;
  };
  process: {
    eyebrow: string;
    title: string;
    lead: string;
    steps: {
      discover: { title: string; desc: string };
      map: { title: string; desc: string };
      prototype: { title: string; desc: string };
      build: { title: string; desc: string };
      test: { title: string; desc: string };
      deploy: { title: string; desc: string };
    };
  };
  aiNative: {
    eyebrow: string;
    title: React.ReactNode;
    lead: string;
  };
  core: {
    eyebrow: string;
    title: string;
    lead: string;
  };
  work: {
    eyebrow: string;
    title: string;
    lead: string;
    note: string;
    exploreBtn: string;
  };
  caseStudy: {
    eyebrow: string;
    title: string;
    lead: string;
    flow: {
      problem: { title: string; desc: string };
      existing: { title: string; desc: string };
      solution: { title: string; desc: string };
      system: { title: string; desc: string };
      result: { title: string; desc: string };
    };
    existingTitle: string;
    existingDesc: string;
    solutionTitle: string;
    solutionDesc: string;
    shots: {
      dashboard: { title: string; desc: string };
      profile: { title: string; desc: string };
      assignment: { title: string; desc: string };
      payment: { title: string; desc: string };
    };
  };
  technology: {
    eyebrow: string;
    title: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    lead: string;
    responseLabel: string;
    responseValue: string;
    noCommitment: string;
    form: {
      name: string;
      namePlaceholder: string;
      company: string;
      companyPlaceholder: string;
      emailPlaceholder: string;
      message: string;
      messagePlaceholder: string;
      submitBtn: string;
      sendingBtn: string;
      delivered: string;
      errorEmpty: string;
    };
  };
  footer: {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    siteLabel: string;
    contactLabel: string;
    copyright: string;
    tagline: string;
  };
};
