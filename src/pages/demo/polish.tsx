import { LayoutNew } from '@/components/layout';
import { useState } from 'react';
import {
  FeedbackMessage,
  SuccessMessage,
  ErrorMessage,
  WarningMessage,
  InfoMessage,
  PageLoading,
  InlineLoading,
  LoadingOverlay,
  CopyButton,
  InlineCopy,
  EmptyState,
  Button,
  Card,
  CardBody,
  ConfirmationModal,
} from '@/components/ui';

export default function PolishDemo() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState({
    success: true,
    error: true,
    warning: true,
    info: true,
  });

  return (
    <LayoutNew>
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold font-heading gradient-heading mb-2">
            Phase 7: Polish & Micro-interactions
          </h1>
          <p className="text-muted-foreground text-lg">
            Showcasing premium UI polish, feedback systems, and delightful micro-interactions.
          </p>
        </div>

        {/* Feedback Messages */}
        <section>
          <h2 className="text-2xl font-bold font-heading mb-4">Feedback Messages</h2>
          <div className="space-y-4">
            {feedbackVisible.success && (
              <SuccessMessage
                title="Success!"
                message="Your changes have been saved successfully."
                onDismiss={() => setFeedbackVisible({ ...feedbackVisible, success: false })}
              />
            )}
            {feedbackVisible.error && (
              <ErrorMessage
                title="Error occurred"
                message="There was a problem processing your request. Please try again."
                onDismiss={() => setFeedbackVisible({ ...feedbackVisible, error: false })}
              />
            )}
            {feedbackVisible.warning && (
              <WarningMessage
                title="Warning"
                message="This action will affect multiple threads. Please review before continuing."
                onDismiss={() => setFeedbackVisible({ ...feedbackVisible, warning: false })}
              />
            )}
            {feedbackVisible.info && (
              <InfoMessage
                title="New feature available"
                message="Check out our new intelligence dashboard for deeper insights."
                onDismiss={() => setFeedbackVisible({ ...feedbackVisible, info: false })}
              />
            )}
          </div>
        </section>

        {/* Loading States */}
        <section>
          <h2 className="text-2xl font-bold font-heading mb-4">Loading States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardBody>
                <h3 className="font-semibold mb-4">Inline Loading</h3>
                <div className="flex items-center gap-4">
                  <InlineLoading size="sm" />
                  <span className="text-muted-foreground">Small</span>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <InlineLoading size="md" />
                  <span className="text-muted-foreground">Medium</span>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <InlineLoading size="lg" />
                  <span className="text-muted-foreground">Large</span>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h3 className="font-semibold mb-4">Loading Overlay</h3>
                <LoadingOverlay isLoading={showOverlay} message="Processing...">
                  <div className="h-40 flex items-center justify-center bg-muted rounded-lg">
                    <p className="text-muted-foreground">Content beneath overlay</p>
                  </div>
                </LoadingOverlay>
                <Button
                  onClick={() => setShowOverlay(!showOverlay)}
                  className="mt-4"
                  size="sm"
                >
                  {showOverlay ? 'Hide' : 'Show'} Overlay
                </Button>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Copy Button */}
        <section>
          <h2 className="text-2xl font-bold font-heading mb-4">Copy Interactions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardBody>
                <h3 className="font-semibold mb-4">Copy Button Variants</h3>
                <div className="flex items-center gap-4">
                  <CopyButton text="Hello World" size="sm" />
                  <CopyButton text="Hello World" size="md" />
                  <CopyButton text="Hello World" size="lg" />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <h3 className="font-semibold mb-4">Inline Copy</h3>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <div className="flex items-center justify-between">
                    <code>npm install synapse</code>
                    <InlineCopy text="npm install synapse" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Empty States */}
        <section>
          <h2 className="text-2xl font-bold font-heading mb-4">Empty States</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState
              illustration="no-results"
              title="No results found"
              description="Try adjusting your search terms or filters."
              variant="compact"
              action={{
                label: 'Clear filters',
                onClick: () => alert('Clearing filters'),
              }}
            />

            <EmptyState
              illustration="error"
              title="Something went wrong"
              description="We encountered an error loading this content."
              variant="compact"
              action={{
                label: 'Try again',
                onClick: () => alert('Retrying'),
              }}
            />
          </div>
        </section>

        {/* Confirmation Modal */}
        <section>
          <h2 className="text-2xl font-bold font-heading mb-4">Confirmation Dialogs</h2>
          <Card>
            <CardBody>
              <Button onClick={() => setShowConfirmation(true)}>
                Show Delete Confirmation
              </Button>
            </CardBody>
          </Card>
        </section>

        {/* Premium Effects */}
        <section>
          <h2 className="text-2xl font-bold font-heading mb-4">Premium Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover-lift">
              <CardBody>
                <h3 className="font-semibold mb-2">Hover Lift</h3>
                <p className="text-sm text-muted-foreground">
                  Hover over this card to see the lift effect.
                </p>
              </CardBody>
            </Card>

            <Card className="hover-glow">
              <CardBody>
                <h3 className="font-semibold mb-2">Hover Glow</h3>
                <p className="text-sm text-muted-foreground">
                  Hover over this card to see the golden glow.
                </p>
              </CardBody>
            </Card>

            <Card className="glass-card">
              <CardBody>
                <h3 className="font-semibold mb-2">Glass Effect</h3>
                <p className="text-sm text-muted-foreground">
                  Premium glassmorphism styling.
                </p>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Gradient Heading Example */}
        <section>
          <h2 className="text-2xl font-bold font-heading mb-4">Typography Effects</h2>
          <Card>
            <CardBody>
              <h3 className="text-3xl font-bold gradient-heading mb-4">
                Gradient Heading Effect
              </h3>
              <p className="text-muted-foreground">
                Premium golden gradient text for hero headings and important titles.
              </p>
            </CardBody>
          </Card>
        </section>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={() => {
            alert('Deleted!');
            setShowConfirmation(false);
          }}
          title="Delete Thread"
          message="Are you sure you want to delete this thread? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
    </LayoutNew>
  );
}
