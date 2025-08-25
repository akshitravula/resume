import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Check, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AIEditDialogProps {
  currentContent: string;
  section: string;
  onUpdate: (newContent: string) => void;
}

export function AIEditDialog({ currentContent, section, onUpdate }: AIEditDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    try {
      // Replace with your actual API call
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          currentContent,
          section
        })
      });
      const data = await response.json();
      setSuggestion(data.suggestion);
    } catch (error) {
      console.error('AI suggestion error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    onUpdate(suggestion);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="h-8 w-8 text-orange-500 hover:text-orange-600"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>AI Edit Suggestions</DialogTitle>
          <DialogDescription>
            Describe how you'd like to improve this section
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Enter your prompt... (e.g., Make this more concise, Add more technical details)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="h-20"
            />
            <Button 
              onClick={handleGetSuggestion}
              disabled={isLoading || !prompt.trim()}
              className="w-full"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Get AI Suggestion
                </span>
              )}
            </Button>
          </div>

          {suggestion && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Current Version</h4>
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    <div className="whitespace-pre-wrap">{currentContent}</div>
                  </ScrollArea>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">AI Suggestion</h4>
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    <div className="whitespace-pre-wrap">{suggestion}</div>
                  </ScrollArea>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleApply}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Apply Changes
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}