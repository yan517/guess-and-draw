const form = document.querySelector('#entryForm');
let {username} = "";

if(form){
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let username  = document.querySelector('#username').value;
        if (username === ""){
                alert('請輸入用戶名稱');
        }else{
            goToLounge(username);
        }
    });
}

const goToLounge = async (username) => {
    const response = await fetch(`/currentUserStatus`, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username})
    });
    const json = await response.json();
     if (json.status == "success"){
        sessionStorage.setItem("usernameStart", json.result.username);
        window.location.href = `/lounge`;
    }else
        alert(json.status);  
}