// CaseAddForm機能テスト用スクリプト
// ブラウザのコンソールで手動実行用

console.log('=== CaseAddForm 機能テスト ===');

// テスト1: フォームの表示確認
function testFormDisplay() {
  console.log('テスト1: フォームの表示確認');
  
  // 事例追加ボタンを探す
  const addButton = document.querySelector('button[title="事例追加"]') || 
                   Array.from(document.querySelectorAll('button')).find(btn => 
                     btn.textContent.includes('事例追加')
                   );
  
  if (addButton) {
    console.log('✓ 事例追加ボタンが見つかりました');
    console.log('  ボタンをクリックしてテストしてください');
    return true;
  } else {
    console.log('✗ 事例追加ボタンが見つかりません');
    return false;
  }
}

// テスト2: 必須フィールドのバリデーション確認
function testValidation() {
  console.log('テスト2: バリデーション確認');
  
  const companyNameInput = document.querySelector('input[id="companyName"]');
  const industrySelect = document.querySelector('select[id="industry"]');
  const regionSelect = document.querySelector('select[id="region"]');
  const prefectureSelect = document.querySelector('select[id="prefecture"]');
  const citySelect = document.querySelector('select[id="city"]');
  const submitButton = document.querySelector('button[type="submit"]');
  
  if (companyNameInput && industrySelect && regionSelect && prefectureSelect && citySelect && submitButton) {
    console.log('✓ 全ての必須フィールドが見つかりました');
    console.log('  - 企業名入力フィールド');
    console.log('  - 業種選択フィールド');
    console.log('  - 地域選択フィールド');
    console.log('  - 都道府県選択フィールド');
    console.log('  - 市区町村選択フィールド');
    console.log('  - 送信ボタン');
    return true;
  } else {
    console.log('✗ 一部のフィールドが見つかりません');
    console.log('  企業名:', !!companyNameInput);
    console.log('  業種:', !!industrySelect);
    console.log('  地域:', !!regionSelect);
    console.log('  都道府県:', !!prefectureSelect);
    console.log('  市区町村:', !!citySelect);
    console.log('  送信ボタン:', !!submitButton);
    return false;
  }
}

// テスト3: 地域階層選択の動作確認
function testRegionHierarchy() {
  console.log('テスト3: 地域階層選択の動作確認');
  
  const regionSelect = document.querySelector('select[id="region"]');
  const prefectureSelect = document.querySelector('select[id="prefecture"]');
  const citySelect = document.querySelector('select[id="city"]');
  
  if (regionSelect && prefectureSelect && citySelect) {
    console.log('✓ 地域階層選択フィールドが見つかりました');
    console.log('  関東を選択して都道府県が更新されるかテストしてください');
    
    // 関東を選択
    regionSelect.value = '関東';
    regionSelect.dispatchEvent(new Event('change', { bubbles: true }));
    
    setTimeout(() => {
      const prefectureOptions = Array.from(prefectureSelect.options).map(opt => opt.value).filter(val => val);
      console.log('  関東選択後の都道府県オプション:', prefectureOptions);
      
      if (prefectureOptions.includes('東京都')) {
        console.log('✓ 地域階層選択が正常に動作しています');
      } else {
        console.log('✗ 地域階層選択に問題があります');
      }
    }, 100);
    
    return true;
  } else {
    console.log('✗ 地域階層選択フィールドが見つかりません');
    return false;
  }
}

// メインテスト実行
function runTests() {
  console.log('CaseAddFormのテストを開始します...');
  
  // フォームが表示されているかチェック
  const isFormVisible = document.querySelector('input[id="companyName"]') !== null;
  
  if (!isFormVisible) {
    console.log('まず事例追加 → 事例を追加するボタンをクリックしてフォームを表示してください');
    testFormDisplay();
  } else {
    console.log('フォームが表示されています。テストを実行します...');
    testValidation();
    testRegionHierarchy();
  }
}

// 自動実行
runTests();

// ブラウザのコンソールで手動実行できるように関数をエクスポート
window.testCaseAddForm = {
  runTests,
  testFormDisplay,
  testValidation,
  testRegionHierarchy
};

console.log('=== テスト完了 ===');
console.log('手動テスト: window.testCaseAddForm.runTests() を実行してください');