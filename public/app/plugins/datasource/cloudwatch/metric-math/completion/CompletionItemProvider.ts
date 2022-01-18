import type { Monaco, monacoTypes } from '@grafana/ui';
import { TRIGGER_SUGGEST } from '../../monarch/commands';
import { SuggestionKind, CompletionItemPriority, StatementPosition } from '../../monarch/types';
import { LinkedToken } from '../../monarch/LinkedToken';
import { METRIC_MATH_FNS, METRIC_MATH_KEYWORDS, METRIC_MATH_OPERATORS } from '../language';
import { CompletionItemProvider } from '../../monarch/CompletionItemProvider';

type CompletionItem = monacoTypes.languages.CompletionItem;

export class MetricMathCompletionItemProvider extends CompletionItemProvider {
  async getSuggestions(
    monaco: Monaco,
    currentToken: LinkedToken | null,
    suggestionKinds: SuggestionKind[],
    statementPosition: StatementPosition,
    position: monacoTypes.IPosition
  ): Promise<CompletionItem[]> {
    let suggestions: CompletionItem[] = [];
    const invalidRangeToken = currentToken?.isWhiteSpace() || currentToken?.isParenthesis();
    const range =
      invalidRangeToken || !currentToken?.range ? monaco.Range.fromPositions(position) : currentToken?.range;

    const toCompletionItem = (value: string, rest: Partial<CompletionItem> = {}) => {
      const item: CompletionItem = {
        label: value,
        insertText: value,
        kind: monaco.languages.CompletionItemKind.Field,
        range,
        sortText: CompletionItemPriority.Medium,
        ...rest,
      };
      return item;
    };

    function addSuggestion(value: string, rest: Partial<CompletionItem> = {}) {
      suggestions = [...suggestions, toCompletionItem(value, rest)];
    }

    for (const suggestion of suggestionKinds) {
      switch (suggestion) {
        case SuggestionKind.FunctionsWithArguments:
          METRIC_MATH_FNS.map((f) =>
            addSuggestion(f, {
              insertText: f === 'SEARCH' ? `${f}('$0')` : `${f}($0)`,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              command: TRIGGER_SUGGEST,
              kind: monaco.languages.CompletionItemKind.Function,
            })
          );
          break;

        case SuggestionKind.KeywordArguments:
          METRIC_MATH_KEYWORDS.map((s) =>
            addSuggestion(s, {
              insertText: `${s} `,
              command: TRIGGER_SUGGEST,
            })
          );
          break;

        case SuggestionKind.Operators:
          METRIC_MATH_OPERATORS.map((s) =>
            addSuggestion(s, {
              insertText: `${s} `,
              command: TRIGGER_SUGGEST,
            })
          );
      }
    }

    // always suggest template variables
    this.templateVariables.map((v) => {
      addSuggestion(v, {
        range,
        label: v,
        insertText: v,
        kind: monaco.languages.CompletionItemKind.Variable,
        sortText: CompletionItemPriority.MediumHigh,
      });
    });

    return suggestions;
  }
}
