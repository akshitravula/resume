// fieldConnectionSystem.ts - The glue code for connecting preview fields to form inputs

import { RefObject } from 'react';

export interface FieldMapping {
  previewSelector: string;  // CSS selector or data attribute for preview field
  formFieldId: string;     // ID of the form input field
  section?: string;        // Optional section name for better organization
}

// Define all field mappings - easily extensible
export const FIELD_MAPPINGS: FieldMapping[] = [
  // Personal Info
  { previewSelector: '[data-field="fullName"]', formFieldId: 'fullName', section: 'personal' },
  { previewSelector: '[data-field="jobTitle"]', formFieldId: 'jobTitle', section: 'personal' },
  { previewSelector: '[data-field="email"]', formFieldId: 'email', section: 'personal' },
  { previewSelector: '[data-field="phone"]', formFieldId: 'phone', section: 'personal' },
  { previewSelector: '[data-field="summary"]', formFieldId: 'summary', section: 'personal' },
  
  // Work Experience - dynamic IDs based on experience.id
  // These will be handled dynamically in the setup function
  
  // Education - dynamic IDs based on education.id
  // These will be handled dynamically in the setup function
  
  // Add more static mappings as needed
];

export class FieldConnectionManager {
  private previewRef: RefObject<HTMLElement>;
  private formRef: RefObject<HTMLElement>;
  private highlightTimeout: NodeJS.Timeout | null = null;

  constructor(previewRef: RefObject<HTMLElement>, formRef: RefObject<HTMLElement>) {
    this.previewRef = previewRef;
    this.formRef = formRef;
  }

  // Initialize click listeners on preview fields
  setupClickListeners(resumeData: any) {
    if (!this.previewRef.current) return;

    const previewElement = this.previewRef.current;

    // Handle static field mappings
    FIELD_MAPPINGS.forEach(mapping => {
      const previewField = previewElement.querySelector(mapping.previewSelector);
      if (previewField) {
        previewField.addEventListener('click', () => {
          this.handleFieldClick(mapping.formFieldId);
        });
        // Add visual cues
        this.addClickableStyles(previewField as HTMLElement);
      }
    });

    // Handle dynamic work experience fields
    resumeData.workExperience?.forEach((experience: any) => {
      const expFields = [
        { selector: `[data-field="workExperience.${experience.id}.title"]`, fieldId: `work-title-${experience.id}` },
        { selector: `[data-field="workExperience.${experience.id}.company"]`, fieldId: `work-company-${experience.id}` },
        { selector: `[data-field="workExperience.${experience.id}.description"]`, fieldId: `work-description-${experience.id}` },
      ];

      expFields.forEach(field => {
        const previewField = previewElement.querySelector(field.selector);
        if (previewField) {
          previewField.addEventListener('click', () => {
            this.handleFieldClick(field.fieldId);
          });
          this.addClickableStyles(previewField as HTMLElement);
        }
      });
    });

    // Handle dynamic education fields
    resumeData.education?.forEach((education: any) => {
      const eduFields = [
        { selector: `[data-field="education.${education.id}.degree"]`, fieldId: `edu-degree-${education.id}` },
        { selector: `[data-field="education.${education.id}.institution"]`, fieldId: `edu-institution-${education.id}` },
        { selector: `[data-field="education.${education.id}.year"]`, fieldId: `edu-year-${education.id}` },
      ];

      eduFields.forEach(field => {
        const previewField = previewElement.querySelector(field.selector);
        if (previewField) {
          previewField.addEventListener('click', () => {
            this.handleFieldClick(field.fieldId);
          });
          this.addClickableStyles(previewField as HTMLElement);
        }
      });
    });

    // Add more dynamic field handlers for projects, achievements, etc.
    this.setupProjectFields(resumeData);
    this.setupPORFields(resumeData);
    this.setupAchievementFields(resumeData);
    this.setupCertificationFields(resumeData);
    this.setupSkillFields(resumeData);
  }

  private setupProjectFields(resumeData: any) {
    if (!this.previewRef.current) return;
    
    resumeData.projects?.forEach((project: any) => {
      const projectFields = [
        { selector: `[data-field="project.${project.id}.title"]`, fieldId: `project-title-${project.id}` },
        { selector: `[data-field="project.${project.id}.description"]`, fieldId: `project-description-${project.id}` },
        { selector: `[data-field="project.${project.id}.technologies"]`, fieldId: `project-tech-${project.id}` },
      ];

      projectFields.forEach(field => {
        const previewField = this.previewRef.current!.querySelector(field.selector);
        if (previewField) {
          previewField.addEventListener('click', () => {
            this.handleFieldClick(field.fieldId);
          });
          this.addClickableStyles(previewField as HTMLElement);
        }
      });
    });
  }

  private setupPORFields(resumeData: any) {
    if (!this.previewRef.current) return;
    
    resumeData.pors?.forEach((por: any) => {
      const porFields = [
        { selector: `[data-field="por.${por.id}.position"]`, fieldId: `por-position-${por.id}` },
        { selector: `[data-field="por.${por.id}.organization"]`, fieldId: `por-organization-${por.id}` },
        { selector: `[data-field="por.${por.id}.description"]`, fieldId: `por-description-${por.id}` },
      ];

      porFields.forEach(field => {
        const previewField = this.previewRef.current!.querySelector(field.selector);
        if (previewField) {
          previewField.addEventListener('click', () => {
            this.handleFieldClick(field.fieldId);
          });
          this.addClickableStyles(previewField as HTMLElement);
        }
      });
    });
  }

  private setupAchievementFields(resumeData: any) {
    if (!this.previewRef.current) return;
    
    resumeData.achievements?.forEach((achievement: any) => {
      const achievementFields = [
        { selector: `[data-field="achievement.${achievement.id}.title"]`, fieldId: `achievement-title-${achievement.id}` },
        { selector: `[data-field="achievement.${achievement.id}.description"]`, fieldId: `achievement-description-${achievement.id}` },
      ];

      achievementFields.forEach(field => {
        const previewField = this.previewRef.current!.querySelector(field.selector);
        if (previewField) {
          previewField.addEventListener('click', () => {
            this.handleFieldClick(field.fieldId);
          });
          this.addClickableStyles(previewField as HTMLElement);
        }
      });
    });
  }

  private setupCertificationFields(resumeData: any) {
    if (!this.previewRef.current) return;
    
    resumeData.certifications?.forEach((cert: any) => {
      const certFields = [
        { selector: `[data-field="certification.${cert.id}.name"]`, fieldId: `cert-name-${cert.id}` },
        { selector: `[data-field="certification.${cert.id}.issuer"]`, fieldId: `cert-issuer-${cert.id}` },
      ];

      certFields.forEach(field => {
        const previewField = this.previewRef.current!.querySelector(field.selector);
        if (previewField) {
          previewField.addEventListener('click', () => {
            this.handleFieldClick(field.fieldId);
          });
          this.addClickableStyles(previewField as HTMLElement);
        }
      });
    });
  }

  private setupSkillFields(resumeData: any) {
    if (!this.previewRef.current) return;
    
    const skillFields = [
      { selector: '[data-field="skills.technical"]', fieldId: 'skills-technical' },
      { selector: '[data-field="skills.languages"]', fieldId: 'skills-languages' },
      { selector: '[data-field="skills.frameworks"]', fieldId: 'skills-frameworks' },
      { selector: '[data-field="skills.tools"]', fieldId: 'skills-tools' },
    ];

    skillFields.forEach(field => {
      const previewField = this.previewRef.current!.querySelector(field.selector);
      if (previewField) {
        previewField.addEventListener('click', () => {
          this.handleFieldClick(field.fieldId);
        });
        this.addClickableStyles(previewField as HTMLElement);
      }
    });
  }

  // Add visual cues that fields are clickable
  private addClickableStyles(element: HTMLElement) {
    element.style.cursor = 'pointer';
    element.style.transition = 'all 0.2s ease';
    
    element.addEventListener('mouseenter', () => {
      element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      element.style.borderRadius = '4px';
      element.style.padding = '2px 4px';
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.backgroundColor = '';
      element.style.borderRadius = '';
      element.style.padding = '';
    });
  }

  // Handle the click -> scroll -> focus -> highlight sequence
  private handleFieldClick(formFieldId: string) {
    if (!this.formRef.current) return;

    const formField = this.formRef.current.querySelector(`#${formFieldId}`) as HTMLInputElement | HTMLTextAreaElement;
    
    if (formField) {
      // Smooth scroll to the field
      formField.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Focus the field after a brief delay to ensure scrolling completes
      setTimeout(() => {
        formField.focus();
        
        // Select text for inputs (not for textareas)
        if (formField.tagName === 'INPUT') {
          formField.select();
        }

        // Add highlight effect
        this.highlightField(formField);
      }, 500);
    }
  }

  // Highlight the focused field with a fade-out animation
  private highlightField(field: HTMLElement) {
    // Clear any existing highlight timeout
    if (this.highlightTimeout) {
      clearTimeout(this.highlightTimeout);
    }

    // Add highlight class
    field.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)';
    field.style.transition = 'box-shadow 0.3s ease';

    // Remove highlight after 2 seconds
    this.highlightTimeout = setTimeout(() => {
      field.style.boxShadow = '';
      field.style.transition = '';
    }, 2000);
  }

  // Clean up event listeners
  cleanup() {
    if (this.highlightTimeout) {
      clearTimeout(this.highlightTimeout);
    }
    
    if (this.previewRef.current) {
      // Remove all click listeners by cloning and replacing the element
      // This is a simple way to remove all attached event listeners
      const previewElement = this.previewRef.current;
      const newElement = previewElement.cloneNode(true);
      previewElement.parentNode?.replaceChild(newElement, previewElement);
    }
  }
}

// Usage Hook for easy integration
export const useFieldConnection = (
  previewRef: RefObject<HTMLElement>, 
  formRef: RefObject<HTMLElement>
) => {
  let connectionManager: FieldConnectionManager | null = null;

  const initializeConnections = (resumeData: any) => {
    // Clean up previous connections
    if (connectionManager) {
      connectionManager.cleanup();
    }

    // Create new connection manager
    connectionManager = new FieldConnectionManager(previewRef, formRef);
    connectionManager.setupClickListeners(resumeData);
  };

  const cleanup = () => {
    if (connectionManager) {
      connectionManager.cleanup();
      connectionManager = null;
    }
  };

  return { initializeConnections, cleanup };
};