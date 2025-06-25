import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CaseAddForm } from '../CaseAddForm';

// Mock functions
const mockOnStartInterview = jest.fn();
const mockOnClose = jest.fn();

const defaultProps = {
  onStartInterview: mockOnStartInterview,
  onClose: mockOnClose
};

describe('CaseAddForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('レンダリングと基本要素の表示', () => {
    render(<CaseAddForm {...defaultProps} />);
    
    // ヘッダーの確認
    expect(screen.getByText('新規事例追加')).toBeInTheDocument();
    
    // 必須フィールドの確認
    expect(screen.getByLabelText(/企業名/)).toBeInTheDocument();
    expect(screen.getByText(/業種.*複数選択可能/)).toBeInTheDocument();
    expect(screen.getByLabelText(/地域/)).toBeInTheDocument();
    expect(screen.getByLabelText(/都道府県/)).toBeInTheDocument();
    expect(screen.getByLabelText(/市区町村/)).toBeInTheDocument();
    expect(screen.getByLabelText(/企業規模/)).toBeInTheDocument();
    
    // ボタンの確認
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
    expect(screen.getByText('AIヒヤリング開始')).toBeInTheDocument();
  });

  test('キャンセルボタンの動作', () => {
    render(<CaseAddForm {...defaultProps} />);
    
    // キャンセルボタンをクリック
    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('バリデーション - 空のフィールドでエラー表示', async () => {
    render(<CaseAddForm {...defaultProps} />);
    
    // フォームを送信
    const submitButton = screen.getByText('AIヒヤリング開始');
    fireEvent.click(submitButton);
    
    // バリデーションエラーの確認
    await waitFor(() => {
      expect(screen.getByText('企業名は必須です')).toBeInTheDocument();
      expect(screen.getByText('業種を1つ以上選択してください')).toBeInTheDocument();
      expect(screen.getByText('地域は必須です')).toBeInTheDocument();
      expect(screen.getByText('都道府県は必須です')).toBeInTheDocument();
      expect(screen.getByText('市区町村は必須です')).toBeInTheDocument();
    });
    
    // onStartInterviewが呼ばれていないことを確認
    expect(mockOnStartInterview).not.toHaveBeenCalled();
  });

  test('地域階層選択の動作確認', async () => {
    render(<CaseAddForm {...defaultProps} />);
    
    const regionSelect = screen.getByLabelText(/地域/);
    const prefectureSelect = screen.getByLabelText(/都道府県/);
    const cityInput = screen.getByLabelText(/市区町村/);
    
    // 初期状態では都道府県は無効、市区町村は有効（テキスト入力）
    expect(prefectureSelect).toBeDisabled();
    expect(cityInput).toBeEnabled();
    
    // 関東を選択
    fireEvent.change(regionSelect, { target: { value: '関東' } });
    
    // 都道府県が有効になり、オプションが表示される
    await waitFor(() => {
      expect(prefectureSelect).toBeEnabled();
      expect(screen.getByRole('option', { name: '東京都' })).toBeInTheDocument();
    });
  });

  test('完全なフォーム入力と送信', async () => {
    render(<CaseAddForm {...defaultProps} />);
    
    // フォームに入力
    fireEvent.change(screen.getByLabelText(/企業名/), { target: { value: '株式会社テスト建設' } });
    
    // 業種をチェックボックスで選択
    const constructionCheckbox = screen.getByRole('checkbox', { name: '建設業' });
    fireEvent.click(constructionCheckbox);
    fireEvent.change(screen.getByLabelText(/地域/), { target: { value: '関東' } });
    
    // 都道府県が有効になるまで待機
    await waitFor(() => {
      expect(screen.getByLabelText(/都道府県/)).toBeEnabled();
    });
    
    fireEvent.change(screen.getByLabelText(/都道府県/), { target: { value: '東京都' } });
    fireEvent.change(screen.getByLabelText(/市区町村/), { target: { value: '千代田区' } });
    fireEvent.change(screen.getByLabelText(/企業規模/), { target: { value: 'large' } });
    
    // フォーム送信
    fireEvent.click(screen.getByText('AIヒヤリング開始'));
    
    // onStartInterviewが正しい値で呼ばれることを確認
    await waitFor(() => {
      expect(mockOnStartInterview).toHaveBeenCalledWith({
        companyName: '株式会社テスト建設',
        industry: ['建設業'],
        mainIndustry: '建設業',
        region: '関東',
        prefecture: '東京都',
        city: '千代田区',
        companySize: 'large'
      });
    });
  });

  test('企業規模の選択肢とラベル', () => {
    render(<CaseAddForm {...defaultProps} />);
    
    const companySizeSelect = screen.getByLabelText(/企業規模/);
    
    // 選択肢の確認
    expect(screen.getByRole('option', { name: '小規模（〜50名）' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '中規模（50-300名）' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '大規模（300名〜）' })).toBeInTheDocument();
    
    // デフォルト値は中規模
    expect(companySizeSelect).toHaveValue('medium');
  });

  test('地域変更時に都道府県と市区町村がリセットされる', async () => {
    render(<CaseAddForm {...defaultProps} />);
    
    const regionSelect = screen.getByLabelText(/地域/);
    const prefectureSelect = screen.getByLabelText(/都道府県/);
    const cityInput = screen.getByLabelText(/市区町村/);
    
    // 関東 → 東京都 → 千代田区を入力
    fireEvent.change(regionSelect, { target: { value: '関東' } });
    await waitFor(() => expect(prefectureSelect).toBeEnabled());
    fireEvent.change(prefectureSelect, { target: { value: '東京都' } });
    fireEvent.change(cityInput, { target: { value: '千代田区' } });
    
    // 値が設定されていることを確認
    expect(prefectureSelect).toHaveValue('東京都');
    expect(cityInput).toHaveValue('千代田区');
    
    // 地域を変更（九州・沖縄に変更）
    fireEvent.change(regionSelect, { target: { value: '九州・沖縄' } });
    
    // 都道府県と市区町村がリセットされることを確認
    await waitFor(() => {
      expect(prefectureSelect).toHaveValue('');
      expect(cityInput).toHaveValue('');
    });
  });

  test('複数業種の選択とメイン業種設定', async () => {
    render(<CaseAddForm {...defaultProps} />);
    
    // 最初の業種を選択（自動的にメインになる）
    const constructionCheckbox = screen.getByRole('checkbox', { name: '建設業' });
    fireEvent.click(constructionCheckbox);
    
    // 選択されていることを確認
    expect(constructionCheckbox).toBeChecked();
    expect(screen.getByText('選択中の業種:')).toBeInTheDocument();
    expect(screen.getByText('★ 建設業')).toBeInTheDocument();
    
    // 2つ目の業種を選択
    const civilCheckbox = screen.getByRole('checkbox', { name: '土木業' });
    fireEvent.click(civilCheckbox);
    
    // メイン業種選択のラジオボタンが表示される
    await waitFor(() => {
      expect(screen.getByText('メイン業種を選択:')).toBeInTheDocument();
    });
    
    // 土木業をメインに変更
    const civilRadio = screen.getByRole('radio', { name: '土木業' });
    fireEvent.click(civilRadio);
    
    // メイン業種が変更されることを確認
    expect(screen.getByText('★ 土木業')).toBeInTheDocument();
  });
});