import { Link } from 'react-router-dom'
import { Check, ArrowRight, ExternalLink } from 'lucide-react'

export default function Landing() {
  return (
    <div className="marketing-page">

      {/* NAV */}
      <nav className="marketing-nav">
        <div className="marketing-nav-logo">WEBHOOK<br/>RECOVERY</div>
        <div className="marketing-nav-links">
          <a href="#features" className="marketing-nav-link">Product</a>
          <a href="#loop" className="marketing-nav-link">How it works</a>
          <a href="#pricing" className="marketing-nav-link">Pricing</a>
          <a href="#" className="marketing-nav-link">Docs <ExternalLink size={11} /></a>
        </div>
        <div className="marketing-nav-actions">
          <Link to="/app" className="marketing-nav-link">Sign in</Link>
          <Link to="/app" className="btn btn-primary btn-sm">Connect GitHub</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="marketing-section hero-section">
        <div className="hero-grid">
          <div className="hero-text">
            <div className="hero-eyebrow">BUILT FOR GITHUB WEBHOOKS</div>
            <h1 className="hero-title">A failed webhook shouldn't stay failed.</h1>
            <p className="hero-subtitle">
              Detect failed deliveries. Redeliver with control. Verify that your events actually made it through.
            </p>
            <div className="hero-actions">
              <Link to="/app" className="btn btn-primary btn-lg">Connect GitHub</Link>
              <Link to="/app" className="hero-link-btn">Explore the workflow <ArrowRight size={14} /></Link>
            </div>
          </div>

          <div className="preview-card">
            <div className="preview-card-header">
              <span className="preview-card-title">acme / platform-api</span>
              <span className="badge badge-green">Monitoring</span>
            </div>
            <div className="preview-card-body">
              <div className="preview-section-label">Delivery activity</div>
              <div className="preview-time-label">Last 24 hours</div>
              <div className="preview-stats">
                <div className="preview-stat">
                  <div className="preview-stat-value">1,284</div>
                  <div className="preview-stat-label">Deliveries</div>
                </div>
                <div className="preview-stat">
                  <div className="preview-stat-value text-red">12</div>
                  <div className="preview-stat-label">Failed</div>
                </div>
                <div className="preview-stat">
                  <div className="preview-stat-value text-green">9</div>
                  <div className="preview-stat-label">Recovered</div>
                </div>
              </div>
              <table className="preview-table">
                <tbody>
                  <tr>
                    <td className="preview-event">push</td>
                    <td className="preview-response">502 Bad Gateway</td>
                    <td><span className="badge badge-red">Failed</span></td>
                  </tr>
                  <tr>
                    <td className="preview-event">pull_request</td>
                    <td className="preview-response">200 OK</td>
                    <td><span className="badge badge-green">Recovered</span></td>
                  </tr>
                  <tr>
                    <td className="preview-event">workflow_run</td>
                    <td className="preview-response">200 OK</td>
                    <td><span className="badge badge-green">Delivered</span></td>
                  </tr>
                </tbody>
              </table>
              <div className="preview-footer">Recovery is verified against the redelivery response.</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="feature-strip" id="features">
        <div className="feature-strip-label">LESS MANUAL RECOVERY. MORE CERTAINTY.</div>
        <div className="feature-strip-items">
          <div className="feature-strip-item">GitHub-native installation</div>
          <div className="feature-strip-sep">·</div>
          <div className="feature-strip-item">Explicit recovery controls</div>
          <div className="feature-strip-sep">·</div>
          <div className="feature-strip-item">Delivery-level audit trail</div>
          <div className="feature-strip-sep">·</div>
          <div className="feature-strip-item">Response-based verification</div>
        </div>
      </section>

      {/* RECOVERY LOOP */}
      <section className="marketing-section" id="loop">
        <div className="marketing-section-header">
          <div className="hero-eyebrow">THE RECOVERY LOOP</div>
          <h2 className="marketing-headline">From failure to a verified response.</h2>
          <p className="marketing-subheadline">Not another retry button. A complete recovery workflow.</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-title">Detect the failure</div>
            <div className="step-desc">See failed deliveries across repositories. Inspect response codes and payloads.</div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-title">Redeliver deliberately</div>
            <div className="step-desc">Retry one delivery or a selected batch. Keep permissions and limits in control.</div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-title">Verify the result</div>
            <div className="step-desc">Track the new delivery and its response. A request accepted is not a recovery.</div>
          </div>
        </div>
      </section>

      {/* DELIVERY DETAIL */}
      <section className="marketing-section alt-section">
        <div className="feature-two-col">
          <div className="feature-col-text">
            <div className="hero-eyebrow">DELIVERY-LEVEL VISIBILITY</div>
            <h2 className="marketing-headline">Find the failure. Keep the context.</h2>
            <p className="marketing-subheadline">No digging through individual repository settings. Every failed event, response, and recovery attempt in one inspectable record.</p>
            <ul className="feature-checklist">
              <li><Check size={14} className="check-icon" /> Filter by repository, event, and response code</li>
              <li><Check size={14} className="check-icon" /> Inspect request payloads and response headers</li>
              <li><Check size={14} className="check-icon" /> Follow the complete redelivery history</li>
            </ul>
            <Link to="/app" className="feature-link">Explore delivery monitoring →</Link>
          </div>
          <div className="preview-card preview-card-sm">
            <div className="preview-card-header">
              <span className="preview-card-title">platform-api / deliveries / a8f3c2d1</span>
            </div>
            <div className="preview-card-body">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                <span className="cell-event">push</span>
                <span className="badge badge-red">Failed</span>
              </div>
              <div className="preview-response-label">502 Bad Gateway</div>
              <div className="preview-section-label" style={{ marginTop: '12px' }}>Response body</div>
              <pre className="code-block">{`{\n  "error": "upstream connection refused"\n}`}</pre>
              <div className="preview-section-label" style={{ marginTop: '12px' }}>RECOVERY TIMELINE</div>
              <div className="timeline-item timeline-item-success">
                <div className="timeline-dot timeline-dot-green"></div>
                <div>
                  <div className="timeline-title">✓ Redelivery verified</div>
                  <div className="timeline-meta">200 OK · 184 ms</div>
                  <div className="timeline-desc">Original delivery and recovery remain linked.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE COL */}
      <section className="marketing-section">
        <div className="marketing-section-header">
          <div className="hero-eyebrow">RECOVERY WITHOUT GUESSWORK</div>
          <h2 className="marketing-headline">You decide what gets retried.</h2>
        </div>
        <div className="three-col-grid">
          <div className="three-col-item">
            <div className="three-col-num">01</div>
            <div className="three-col-label">Controlled redelivery</div>
            <h3 className="three-col-title">Retry the right events</h3>
            <p className="three-col-desc">Select specific failed deliveries or recover in batch. Your endpoint, your timing.</p>
            <a href="#" className="feature-link">Single delivery and bulk recovery →</a>
          </div>
          <div className="three-col-item">
            <div className="three-col-num">02</div>
            <div className="three-col-label">Explicit verification</div>
            <h3 className="three-col-title">Accepted ≠ recovered</h3>
            <p className="three-col-desc">Every redelivery is tracked against an actual HTTP response from your endpoint.</p>
            <a href="#" className="feature-link">Verified against HTTP response →</a>
          </div>
          <div className="three-col-item">
            <div className="three-col-num">03</div>
            <div className="three-col-label">Traceable actions</div>
            <h3 className="three-col-title">Know exactly what happened</h3>
            <p className="three-col-desc">Every redelivery request is logged with the user, timestamp, and outcome.</p>
            <a href="#" className="feature-link">A recovery record you can audit →</a>
          </div>
        </div>
      </section>

      {/* PERMISSIONS */}
      <section className="marketing-section marketing-section-dark">
        <div className="feature-two-col">
          <div className="feature-col-text">
            <div className="hero-eyebrow" style={{ color: '#6b7280' }}>SMALL FOOTPRINT. CLEAR BOUNDARIES.</div>
            <h2 className="marketing-headline">Your infrastructure. Your permissions.</h2>
            <p className="marketing-subheadline">Install a GitHub App, not another dependency.</p>
          </div>
          <div className="permissions-items">
            <div className="permission-item">
              <Check size={14} className="check-icon" />
              <div>
                <div className="permission-title">Selected repositories only</div>
                <div className="permission-desc">Start with one repository. Expand access in GitHub at any time.</div>
              </div>
            </div>
            <div className="permission-item">
              <Check size={14} className="check-icon" />
              <div>
                <div className="permission-title">No source-code access</div>
                <div className="permission-desc">Only repository metadata and webhook events. Never your code.</div>
              </div>
            </div>
            <div className="permission-item">
              <Check size={14} className="check-icon" />
              <div>
                <div className="permission-title">No endpoint changes</div>
                <div className="permission-desc">Your webhook configuration stays exactly as it is.</div>
              </div>
            </div>
            <div className="permission-item">
              <Check size={14} className="check-icon" />
              <div>
                <div className="permission-title">Revoke access at any time</div>
                <div className="permission-desc">Uninstall the GitHub App to disconnect immediately.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="marketing-section" id="pricing">
        <div className="marketing-section-header">
          <div className="hero-eyebrow">STRAIGHTFORWARD PRICING</div>
          <h2 className="marketing-headline">Start small. Recover with confidence.</h2>
          <p className="marketing-subheadline">Monthly billing · Cancel anytime</p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-plan">Developer</div>
            <div className="pricing-price">$0<span className="pricing-period">/month</span></div>
            <div className="pricing-desc">For personal projects</div>
            <ul className="pricing-features">
              <li><Check size={13} /> 3 repositories</li>
              <li><Check size={13} /> 1,000 deliveries/mo</li>
              <li><Check size={13} /> 7-day delivery history</li>
              <li><Check size={13} /> Manual redelivery</li>
            </ul>
            <Link to="/app" className="btn btn-secondary" style={{ display: 'block', textAlign: 'center' }}>Start for free</Link>
          </div>

          <div className="pricing-card pricing-card-featured">
            <div className="pricing-plan-featured-label">FOR PRODUCTION</div>
            <div className="pricing-plan">Team</div>
            <div className="pricing-price">$29<span className="pricing-period">/month</span></div>
            <div className="pricing-desc">For teams running production</div>
            <ul className="pricing-features">
              <li><Check size={13} /> 20 repositories</li>
              <li><Check size={13} /> 50,000 deliveries/mo</li>
              <li><Check size={13} /> 30-day delivery history</li>
              <li><Check size={13} /> Bulk recovery and team access</li>
            </ul>
            <Link to="/app" className="btn btn-primary" style={{ display: 'block', textAlign: 'center' }}>Connect your organization</Link>
          </div>

          <div className="pricing-card">
            <div className="pricing-plan">Scale</div>
            <div className="pricing-price">$99<span className="pricing-period">/month</span></div>
            <div className="pricing-desc">For growing infrastructure</div>
            <ul className="pricing-features">
              <li><Check size={13} /> 100 repositories</li>
              <li><Check size={13} /> 250,000 deliveries/mo</li>
              <li><Check size={13} /> 90-day delivery history</li>
              <li><Check size={13} /> Advanced controls and priority support</li>
            </ul>
            <Link to="/app" className="btn btn-secondary" style={{ display: 'block', textAlign: 'center' }}>Choose Scale</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="marketing-section alt-section">
        <div className="marketing-section-header">
          <h2 className="marketing-headline">Good questions. Clear answers.</h2>
        </div>
        <div className="faq-grid">
          <div className="faq-item">
            <div className="faq-q">Does this replace my webhook endpoint?</div>
            <div className="faq-a">No. Keep your existing endpoints and GitHub webhook configuration. Recovery works with your current setup.</div>
          </div>
          <div className="faq-item">
            <div className="faq-q">What counts as a successful recovery?</div>
            <div className="faq-a">A redelivery with a successful 2xx response from your endpoint. Queued requests remain pending verification.</div>
          </div>
          <div className="faq-item">
            <div className="faq-q">Who can request redelivery?</div>
            <div className="faq-a">By default, any workspace member. You can restrict this to admins only in your recovery policy settings.</div>
          </div>
          <div className="faq-item">
            <div className="faq-q">Is the original payload modified?</div>
            <div className="faq-a">No. GitHub sends the exact original event payload. The redelivery is identical to what originally failed.</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="marketing-section">
        <div className="cta-banner">
          <h2 className="cta-title">Your next failed delivery doesn't have to be a lost event.</h2>
          <p className="cta-subtitle">Connect GitHub and see what needs attention.</p>
          <Link to="/app" className="btn btn-primary btn-lg">Connect GitHub →</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="marketing-footer">
        <div className="marketing-footer-left">
          <div className="marketing-nav-logo" style={{ fontSize: '10px' }}>WEBHOOK RECOVERY</div>
          <span className="footer-copy">© 2026 Webhook Recovery</span>
        </div>
        <div className="marketing-footer-links">
          <a href="#">Documentation</a>
          <a href="#">Status</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  )
}
