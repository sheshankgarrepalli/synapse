/**
 * Daily Digest Email Template
 * Beautiful, responsive HTML email with dark theme support
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';
import { DigestEmailProps } from '../lib/digest/digestTypes';
import { format } from 'date-fns';

export const DailyDigestEmail = ({ data, unsubscribeUrl, preferencesUrl, viewInBrowserUrl }: DigestEmailProps) => {
  const { user, organization, date, alerts, warnings, goodNews, activeThreads, stats } = data;

  const formattedDate = format(date, 'EEEE, MMMM d, yyyy');
  const hasAlerts = alerts.length > 0;
  const hasWarnings = warnings.length > 0;
  const hasGoodNews = goodNews.length > 0;
  const hasContent = hasAlerts || hasWarnings || hasGoodNews || activeThreads.length > 0;

  return (
    <Html>
      <Head />
      <Preview>
        {hasAlerts
          ? `${alerts.length} alert${alerts.length > 1 ? 's' : ''} in your Golden Threads`
          : hasGoodNews
          ? `${goodNews.length} update${goodNews.length > 1 ? 's' : ''} in your Golden Threads`
          : 'Your Golden Threads digest'}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Synapse</Heading>
            <Text style={dateText}>{formattedDate}</Text>
          </Section>

          {/* Greeting */}
          <Section style={greetingSection}>
            <Text style={greeting}>Hi {user.firstName},</Text>
            <Text style={intro}>
              Here's what's happening across your Golden Threads:
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Critical Alerts */}
          {hasAlerts && (
            <>
              <Section style={section}>
                <Heading style={h2}>
                  🚨 Critical Alerts ({alerts.length})
                </Heading>
                {alerts.map((alert, index) => (
                  <div key={alert.id} style={alertBox}>
                    <Text style={alertTitle}>• {alert.title}</Text>
                    {alert.threadTitle && (
                      <Text style={alertThread}>"{alert.threadTitle}" thread</Text>
                    )}
                    <Text style={alertDescription}>{alert.description}</Text>
                    {alert.actionUrl && alert.actionLabel && (
                      <Link href={alert.actionUrl} style={actionLink}>
                        → {alert.actionLabel}
                      </Link>
                    )}
                  </div>
                ))}
              </Section>
              <Hr style={divider} />
            </>
          )}

          {/* Warnings */}
          {hasWarnings && (
            <>
              <Section style={section}>
                <Heading style={h2}>
                  ⚠️  Warnings ({warnings.length})
                </Heading>
                {warnings.map((warning) => (
                  <div key={warning.id} style={warningBox}>
                    <Text style={warningTitle}>• {warning.title}</Text>
                    {warning.threadTitle && (
                      <Text style={warningThread}>"{warning.threadTitle}" thread</Text>
                    )}
                    <Text style={warningDescription}>{warning.description}</Text>
                    {warning.actionUrl && warning.actionLabel && (
                      <Link href={warning.actionUrl} style={actionLink}>
                        → {warning.actionLabel}
                      </Link>
                    )}
                  </div>
                ))}
              </Section>
              <Hr style={divider} />
            </>
          )}

          {/* Good News */}
          {hasGoodNews && (
            <>
              <Section style={section}>
                <Heading style={h2}>
                  ✅ Good News ({goodNews.length})
                </Heading>
                {goodNews.map((news) => (
                  <div key={news.id} style={goodNewsBox}>
                    <Text style={goodNewsTitle}>• {news.title}</Text>
                    <Text style={goodNewsDescription}>{news.description}</Text>
                    {news.url && (
                      <Link href={news.url} style={actionLink}>
                        → View details
                      </Link>
                    )}
                  </div>
                ))}
              </Section>
              <Hr style={divider} />
            </>
          )}

          {/* Active Threads */}
          {activeThreads.length > 0 && (
            <>
              <Section style={section}>
                <Heading style={h2}>
                  📊 Your Active Golden Threads ({activeThreads.length})
                </Heading>
                {activeThreads.slice(0, 5).map((thread, index) => (
                  <div key={thread.id} style={threadBox}>
                    <Text style={threadTitle}>
                      {index + 1}. {thread.title} ({thread.status})
                    </Text>
                    <Text style={threadMeta}>
                      {thread.designCount > 0 && `🎨 ${thread.designCount} ${thread.designCount === 1 ? 'design' : 'designs'}  `}
                      {thread.prCount > 0 && `💻 ${thread.prCount} ${thread.prCount === 1 ? 'PR' : 'PRs'}  `}
                      {thread.issueCount > 0 && `📋 ${thread.issueCount} ${thread.issueCount === 1 ? 'issue' : 'issues'}  `}
                      {thread.slackCount > 0 && `💬 ${thread.slackCount} ${thread.slackCount === 1 ? 'conversation' : 'conversations'}`}
                    </Text>
                    <Text style={threadActivity}>
                      Last updated: {format(thread.lastActivityAt, 'MMM d, h:mm a')}
                    </Text>
                    <Link href={thread.url} style={threadLink}>
                      → View thread
                    </Link>
                  </div>
                ))}
                {activeThreads.length > 5 && (
                  <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/threads`} style={viewAllLink}>
                    View all {activeThreads.length} threads →
                  </Link>
                )}
              </Section>
              <Hr style={divider} />
            </>
          )}

          {/* Empty State */}
          {!hasContent && (
            <Section style={section}>
              <Text style={emptyState}>
                No new activity in your Golden Threads today. All caught up!
              </Text>
            </Section>
          )}

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <Link href={preferencesUrl} style={footerLink}>Email Preferences</Link>
              {' | '}
              <Link href={unsubscribeUrl} style={footerLink}>Unsubscribe</Link>
              {viewInBrowserUrl && (
                <>
                  {' | '}
                  <Link href={viewInBrowserUrl} style={footerLink}>View in Browser</Link>
                </>
              )}
            </Text>
            <Text style={footerCopy}>
              © {new Date().getFullYear()} {organization.name}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default DailyDigestEmail;

// Styles
const main = {
  backgroundColor: '#0F1419',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
  backgroundColor: '#1A1F26',
};

const header = {
  padding: '32px 24px 16px',
  textAlign: 'center' as const,
  backgroundColor: '#0F1419',
  borderBottom: '1px solid #2D3748',
};

const h1 = {
  color: '#9333EA',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px',
  padding: '0',
};

const dateText = {
  color: '#A0AEC0',
  fontSize: '14px',
  margin: '0',
  padding: '0',
};

const greetingSection = {
  padding: '24px 24px 0',
};

const greeting = {
  color: '#FFFFFF',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const intro = {
  color: '#CBD5E0',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
};

const divider = {
  borderColor: '#2D3748',
  margin: '24px 0',
};

const section = {
  padding: '0 24px',
};

const h2 = {
  color: '#FFFFFF',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const alertBox = {
  marginBottom: '16px',
  padding: '16px',
  backgroundColor: '#2D1B1B',
  borderLeft: '4px solid #EF4444',
  borderRadius: '4px',
};

const alertTitle = {
  color: '#FCA5A5',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const alertThread = {
  color: '#CBD5E0',
  fontSize: '13px',
  fontStyle: 'italic',
  margin: '0 0 8px',
};

const alertDescription = {
  color: '#E5E7EB',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 8px',
};

const warningBox = {
  marginBottom: '16px',
  padding: '16px',
  backgroundColor: '#2D2A1B',
  borderLeft: '4px solid #F59E0B',
  borderRadius: '4px',
};

const warningTitle = {
  color: '#FCD34D',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const warningThread = {
  color: '#CBD5E0',
  fontSize: '13px',
  fontStyle: 'italic',
  margin: '0 0 8px',
};

const warningDescription = {
  color: '#E5E7EB',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 8px',
};

const goodNewsBox = {
  marginBottom: '16px',
  padding: '16px',
  backgroundColor: '#1B2D1B',
  borderLeft: '4px solid #10B981',
  borderRadius: '4px',
};

const goodNewsTitle = {
  color: '#6EE7B7',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const goodNewsDescription = {
  color: '#E5E7EB',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 8px',
};

const threadBox = {
  marginBottom: '16px',
  padding: '16px',
  backgroundColor: '#1A1F26',
  border: '1px solid #2D3748',
  borderRadius: '4px',
};

const threadTitle = {
  color: '#FFFFFF',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const threadMeta = {
  color: '#A0AEC0',
  fontSize: '13px',
  margin: '0 0 4px',
  lineHeight: '1.5',
};

const threadActivity = {
  color: '#718096',
  fontSize: '12px',
  margin: '0 0 8px',
};

const threadLink = {
  color: '#9333EA',
  fontSize: '14px',
  textDecoration: 'none',
  fontWeight: '500',
};

const actionLink = {
  color: '#9333EA',
  fontSize: '14px',
  textDecoration: 'none',
  fontWeight: '500',
  display: 'inline-block',
  marginTop: '4px',
};

const viewAllLink = {
  color: '#9333EA',
  fontSize: '14px',
  textDecoration: 'none',
  fontWeight: '500',
  display: 'block',
  marginTop: '16px',
};

const emptyState = {
  color: '#A0AEC0',
  fontSize: '14px',
  textAlign: 'center' as const,
  padding: '32px 0',
  lineHeight: '1.5',
};

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#718096',
  fontSize: '12px',
  margin: '0 0 8px',
};

const footerLink = {
  color: '#9333EA',
  textDecoration: 'none',
};

const footerCopy = {
  color: '#4A5568',
  fontSize: '11px',
  margin: '0',
};
