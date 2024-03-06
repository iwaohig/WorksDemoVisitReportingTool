// DOMContentLoaded イベントリスナーを追加
document.addEventListener("DOMContentLoaded", function() {
    initializeWoffApp();
});

// WOFF ID を定義
const WOFF_ID = "hCUPL6OiQxlqRunFoJ5akw";

// WOFF アプリを初期化する関数
function initializeWoffApp() {
    // WOFF_ID が未定義の場合はエラーをログに出力
    if (typeof WOFF_ID === 'undefined') {
        console.error('WOFF_ID is not defined.');
        return;
    }

    woff.init({ woffId: WOFF_ID })
        .then(() => {
            if (!woff.isInClient() && !woff.isLoggedIn()) {
                console.log("ログインを促します。");
                woff.login().catch(err => {
                    console.error("ログインプロセス中にエラーが発生しました:", err);
                });
            } else {
                getProfileAndFillForm();
                // プロファイル情報の取得後、アクセストークンも取得してフォームに設定
                getAccessTokenAndSetToForm();
            }
        })
        .catch(err => {
            console.error("WOFF SDKの初期化に失敗しました:", err);
        });
}

function getProfileAndFillForm() {
    woff.getProfile()
        .then(profile => {
            document.getElementById("displayNameInput").value = profile.displayName;
            document.getElementById("userIdInput").value = profile.userId;
        })
        .catch(err => {
            console.error("プロファイル情報の取得に失敗しました:", err);
        });
}

// 新たにアクセストークンを取得してフォームに設定する関数
// アクセストークンを取得してフォームに設定する関数の修正版
function getAccessTokenAndSetToForm() {
    // 仮定: woff.getAccessToken()が直接トークンを返す場合
    const token = woff.getAccessToken();
    if (token) {
        setAccessTokenToForm(token);
    } else {
        console.error("アクセストークンの取得に失敗しました");
    }
}

// アクセストークンをフォームに設定する処理を分離
function setAccessTokenToForm(token) {
    const tokenField = document.createElement('input');
    tokenField.setAttribute('type', 'hidden');
    tokenField.setAttribute('name', 'accessToken');
    tokenField.setAttribute('value', token);
    document.getElementById("myForm").appendChild(tokenField);
}

function submitForm() {
    // フォーム要素の取得
    const formElement = document.getElementById("myForm");
    // FormDataオブジェクトの作成
    const formData = new FormData(formElement);

    // チェックボックスで選択された関心分野を配列として取得
    const selectedInterests = [];
    const interestCheckboxes = document.querySelectorAll('input[name="customerInterest"]:checked');
    interestCheckboxes.forEach(checkbox => {
        selectedInterests.push(checkbox.value);
    });

    // FormDataに関心分野の配列を追加
    formData.append('customerInterests', selectedInterests.join(','));

    // フォームデータをJSONに変換
    const object = {};
    formData.forEach((value, key) => object[key] = value);
    const json = JSON.stringify(object);

    fetch('https://prod-20.japaneast.logic.azure.com:443/workflows/143e0f6ef4644a3a86af97a12bf6f2b5/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Y3Kzh4iACHUVH5QG29qo73GwpVPcMyGign1FEEUckpA', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: json
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log('Form data sent successfully');
        woff.closeWindow();
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}
