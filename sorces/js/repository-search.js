class RepositorySearch {
    GITHUB_URL = "https://api.github.com/search/repositories";

    _searchForm;
    _searchString;
    _repositoryList;

    constructor() {
        this._searchForm = document.forms.repositorySearchForm;
        this._searchString = this._searchForm.elements.searchString;
        this._repositoryList = document.querySelector(".repository-list");

        this.setListeners();
    }

    resetSearchAttributes() {
        this._searchString.parentElement.setAttribute("data-is-empty", false);
    }

    addAnimation(elem, cssClass, time) {
        elem.classList.add(cssClass);
        setTimeout(() => elem.classList.remove(cssClass), time);
    }

    isValid() {
        if (this._searchString.value) return true;

        const ANIMATION_TIME = 700

        this._searchString.parentElement.setAttribute("data-is-empty", true);
        this.addAnimation(this._searchString.parentElement, "mistake", ANIMATION_TIME);

        return false;
    }

    async getRepositories() {
        const REPOSITORY_QUANTITY = 10;
        const githubUrl = new URL(this.GITHUB_URL);
        
        githubUrl.searchParams.set("q", this._searchString.value);
        githubUrl.searchParams.set("per_page", REPOSITORY_QUANTITY);

        return fetch(githubUrl)
            .then(response => response.json())
            .then(data => data.items)
            .catch(error => console.error(error));
    }

    async createRepositoriesList(repositories) {
        const items = await repositories;

        this._repositoryList.innerHTML = "";

        if (!items || !items.length) {
            this._repositoryList.setAttribute("data-is-nothing-found", true);
        }
        else {
            for (let item of items) {
                const listItem = document.createElement("li");
                
                listItem.className = "repository-item";
                listItem.innerHTML = `
                        <div class="repository-item__field"><span>Название:</span><a href="${item.html_url}" target="_blank">${item.name}</a></div>
                        <div class="repository-item__field"><span>Язык программирования:</span><span>${item.language}</span></div>
                        <div class="repository-item__field"><span>Описание:</span><span>${item.description}</span></div>
                        <div class="repository-item__field"><span>Git URL:</span><span>${item.git_url}</span></div>
                    `;

                this._repositoryList.append(listItem);
            }
        }
    }

    handleSubmit(event) {
        event.preventDefault();

        if (!this.isValid()) return;

        let repositories = this.getRepositories();
        this._repositoryList.setAttribute("data-is-nothing-found", false);
        this.createRepositoriesList(repositories);
    }

    handleEnterKeyup(event) {
        if (event.key != "Enter") return;

        this.handleSubmit(event);
    }

    setListeners() {
        this._searchString.addEventListener("input", this.resetSearchAttributes.bind(this));
        this._searchForm.addEventListener("submit", this.handleSubmit.bind(this));
        document.addEventListener("keyup", this.handleEnterKeyup.bind(this));
    }
}

const repositorySearch = new RepositorySearch();