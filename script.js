fetch("posts.json")
.then(r=>r.json())
.then(posts=>{

let box=document.getElementById("blog-list");

posts.forEach(p=>{

box.innerHTML+=`

<div class="post">

<h2>${p.title}</h2>

<p>${p.desc}</p>

<small>${p.date}</small>

<br><br>

<a href="post.html?id=${p.id}">
Read Story
</a>

</div>

`;

});

});
