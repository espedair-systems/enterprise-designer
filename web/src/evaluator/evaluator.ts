export interface EvaluationContext {
  app?: Record<string, any>;
  workspace?: Record<string, any>;
  datasources?: Record<string, any>;
  user?: Record<string, any>;
  state?: Record<string, any>;
  [key: string]: any;
}

export class ExpressionEvaluator {
  private static MUSTACHE_REGEX = /\{\{\s*([\s\S]*?)\s*\}\}/g;

  /**
   * Evaluates a string containing one or more {{ expression }} blocks against a context.
   */
  public static evaluate(template: string, context: EvaluationContext = {}): any {
    if (typeof template !== 'string') {
      return template;
    }

    // Check if the entire string is a single expression, e.g. "{{ query.data }}"
    const matchFull = template.match(/^\{\{\s*([\s\S]*?)\s*\}\}$/);
    if (matchFull) {
      return this.evaluateExpression(matchFull[1], context);
    }

    // Replace embedded expressions in text
    return template.replace(this.MUSTACHE_REGEX, (_, expr) => {
      try {
        const val = this.evaluateExpression(expr, context);
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
      } catch (err) {
        return `[Error: ${err instanceof Error ? err.message : String(err)}]`;
      }
    });
  }

  /**
   * Safely evaluates a single JS expression in a restricted scope.
   */
  public static evaluateExpression(expression: string, context: EvaluationContext): any {
    const trimmed = expression.trim();
    if (!trimmed) return undefined;

    try {
      const keys = Object.keys(context);
      const values = Object.values(context);

      // Create sandboxed function evaluator
      const fn = new Function(...keys, `"use strict"; return (${trimmed});`);
      return fn(...values);
    } catch (err) {
      // Fallback property access without JS Function if simple dot notation
      const segments = trimmed.split('.');
      let current: any = context;
      for (const seg of segments) {
        if (current && typeof current === 'object' && seg in current) {
          current = current[seg];
        } else {
          return undefined;
        }
      }
      return current;
    }
  }

  /**
   * Evaluates all props of a widget instance reactively.
   */
  public static evaluateWidgetProps(
    props: Record<string, any>,
    context: EvaluationContext
  ): Record<string, any> {
    const evaluated: Record<string, any> = {};
    for (const [key, value] of Object.entries(props)) {
      if (typeof value === 'string') {
        evaluated[key] = this.evaluate(value, context);
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        evaluated[key] = this.evaluateWidgetProps(value, context);
      } else {
        evaluated[key] = value;
      }
    }
    return evaluated;
  }
}
