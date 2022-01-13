import { monacoTypes } from '@grafana/ui';
import MonacoMock from '../__mocks__/cloudwatch-sql/Monaco';
import TextModel from '../__mocks__/cloudwatch-sql/TextModel';
import { multiLineFullQuery, singleLineFullQuery } from '../__mocks__/cloudwatch-sql/test-data';
import { linkedTokenBuilder } from './linkedTokenBuilder';
import { DESC, SELECT } from '../cloudwatch-sql/language';
import cloudWatchSqlLanguageDefinition from '../cloudwatch-sql/definition';
import { SQLTokenType } from '../cloudwatch-sql/completion/types';

describe('linkedTokenBuilder', () => {
  describe('singleLineFullQuery', () => {
    const testModel = TextModel(singleLineFullQuery.query);

    it('should add correct references to next LinkedToken', () => {
      const position: monacoTypes.IPosition = { lineNumber: 1, column: 0 };
      const current = linkedTokenBuilder(
        MonacoMock,
        cloudWatchSqlLanguageDefinition,
        testModel as monacoTypes.editor.ITextModel,
        position,
        SQLTokenType
      );
      expect(current?.is(SQLTokenType.Keyword, SELECT)).toBeTruthy();
      expect(current?.getNextNonWhiteSpaceToken()?.is(SQLTokenType.Function, 'AVG')).toBeTruthy();
    });

    it('should add correct references to previous LinkedToken', () => {
      const position: monacoTypes.IPosition = { lineNumber: 1, column: singleLineFullQuery.query.length };
      const current = linkedTokenBuilder(
        MonacoMock,
        cloudWatchSqlLanguageDefinition,
        testModel as monacoTypes.editor.ITextModel,
        position,
        SQLTokenType
      );
      expect(current?.is(SQLTokenType.Number, '10')).toBeTruthy();
      expect(current?.getPreviousNonWhiteSpaceToken()?.is(SQLTokenType.Keyword, 'LIMIT')).toBeTruthy();
      expect(
        current?.getPreviousNonWhiteSpaceToken()?.getPreviousNonWhiteSpaceToken()?.is(SQLTokenType.Keyword, DESC)
      ).toBeTruthy();
    });
  });

  describe('multiLineFullQuery', () => {
    const testModel = TextModel(multiLineFullQuery.query);

    it('should add LinkedToken with whitespace in case empty lines', () => {
      const position: monacoTypes.IPosition = { lineNumber: 3, column: 0 };
      const current = linkedTokenBuilder(
        MonacoMock,
        cloudWatchSqlLanguageDefinition,
        testModel as monacoTypes.editor.ITextModel,
        position,
        SQLTokenType
      );
      expect(current).not.toBeNull();
      expect(current?.isWhiteSpace()).toBeTruthy();
    });

    it('should add correct references to next LinkedToken', () => {
      const position: monacoTypes.IPosition = { lineNumber: 1, column: 0 };
      const current = linkedTokenBuilder(
        MonacoMock,
        cloudWatchSqlLanguageDefinition,
        testModel as monacoTypes.editor.ITextModel,
        position,
        SQLTokenType
      );
      expect(current?.is(SQLTokenType.Keyword, SELECT)).toBeTruthy();
      expect(current?.getNextNonWhiteSpaceToken()?.is(SQLTokenType.Function, 'AVG')).toBeTruthy();
    });

    it('should add correct references to previous LinkedToken even when references spans over multiple lines', () => {
      const position: monacoTypes.IPosition = { lineNumber: 6, column: 7 };
      const current = linkedTokenBuilder(
        MonacoMock,
        cloudWatchSqlLanguageDefinition,
        testModel as monacoTypes.editor.ITextModel,
        position,
        SQLTokenType
      );
      expect(current?.is(SQLTokenType.Number, '10')).toBeTruthy();
      expect(current?.getPreviousNonWhiteSpaceToken()?.is(SQLTokenType.Keyword, 'LIMIT')).toBeTruthy();
      expect(
        current?.getPreviousNonWhiteSpaceToken()?.getPreviousNonWhiteSpaceToken()?.is(SQLTokenType.Keyword, DESC)
      ).toBeTruthy();
    });
  });
});
