class RepositorySearch {
    GITHUB_URL = "https://api.github.com/search/repositories";

    _requestIsDone = true;
    _requestStatus;
    _repositoryPage = 1;
    _searchForm;
    _searchString;
    _repositoryList;
    _moreRepositories;
    _moreRepositoriesButton;
    _moreRepositoriesQuantity;
    _moreRepositoriesTotal;

    constructor() {
        this._searchForm = document.forms.repositorySearchForm;
        this._searchString = this._searchForm.elements.searchString;
        this._repositoryList = document.querySelector(".repository-list");
        this._moreRepositories = document.querySelector(".github-search-block__more-repositories");
        this._moreRepositoriesButton = this._moreRepositories.querySelector("button");
        this._moreRepositoriesQuantity = this._moreRepositories.querySelector("span:nth-child(1)");
        this._moreRepositoriesTotal = this._moreRepositories.querySelector("span:nth-child(2)");

        this.setListeners();
    }

    resetSearchAttributes() {
        this._searchString.parentElement.setAttribute("data-is-empty", false);
        this._searchString.parentElement.setAttribute("data-is-too-short", false);
    }

    addAnimation(elem, cssClass, time) {
        elem.classList.add(cssClass);
        setTimeout(() => elem.classList.remove(cssClass), time);
    }

    isValid() {
        if (this._searchString.value.length > 1) return true;

        const ANIMATION_TIME = 700

        if (this._searchString.value.length === 0) {
            this._searchString.parentElement.setAttribute("data-is-empty", true);
        }
        else if (this._searchString.value.length === 1) {
            this._searchString.parentElement.setAttribute("data-is-too-short", true);
        }

        this.addAnimation(this._searchString.parentElement, "mistake", ANIMATION_TIME);

        return false;
    }

    async getRepositories() {
        const REPOSITORY_QUANTITY = 10;
        const githubUrl = new URL(this.GITHUB_URL);
        
        githubUrl.searchParams.set("q", this._searchString.value);
        githubUrl.searchParams.set("page", this._repositoryPage);
        githubUrl.searchParams.set("per_page", REPOSITORY_QUANTITY);

        return fetch(githubUrl)
            .then(response => {
                this._requestStatus = response.status;
                return response.json()
            })
            .then(data => [data.total_count, data.items])
            .catch(error => console.error(error));
    }

    createRepositoriesList(repositories) {
        const [total_count, items] = repositories;

        switch (this._requestStatus) {
            case 200:
                this._moreRepositories.setAttribute("data-status", 200);
                break;
            case 403:
                this._requestIsDone = true;
                this._moreRepositories.setAttribute("data-status", 403);
                break;
        }

        if (this._requestStatus == 200 && (!items || !items.length)) {
            this._repositoryList.setAttribute("data-is-nothing-found", true);
            this._moreRepositories.style.display = "none";
        }
        else {
            this._moreRepositories.style.display = "flex";

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

        this._moreRepositoriesQuantity.textContent = this._repositoryList.children.length;
        this._moreRepositoriesTotal.textContent = total_count;

        if (this._moreRepositoriesQuantity.textContent === this._moreRepositoriesTotal.textContent) {
            this._moreRepositoriesButton.style.display = "none";
        }
        
        this._requestIsDone = true;
    }

    async handleSubmit(event, isAdding) {
        event.preventDefault();

        if (!this.isValid() || !this._requestIsDone) return;

        this._requestIsDone = false;

        if (isAdding) {
            this._repositoryPage++;
        }
        else {
            this._moreRepositoriesButton.style.display = "block";
            this._moreRepositories.style.display = "none";
            this._repositoryList.innerHTML = "";
            this._repositoryPage = 1;
        }

        const repositories = await this.getRepositories();
        this._repositoryList.setAttribute("data-is-nothing-found", false);
        this.createRepositoriesList(repositories);
    }

    handleMoreRepositoriesMouseup(event) {
        this.handleSubmit(event, true);
    }

    handleFormEnterKeydown(event) {
        if (event.keyCode != 13) return;
        
        event.preventDefault();
    }

    handleFormEnterKeyup(event) {
        if (event.keyCode != 13) return;
            
        this.handleSubmit(event, false);
    }

    setListeners() {
        this._searchString.addEventListener("input", this.resetSearchAttributes.bind(this));
        this._searchForm.addEventListener("submit", this.handleSubmit.bind(this));
        this._searchForm.addEventListener("keydown", this.handleFormEnterKeydown.bind(this));
        this._searchForm.addEventListener("keyup", this.handleFormEnterKeyup.bind(this));
        this._moreRepositoriesButton.addEventListener("mouseup", this.handleMoreRepositoriesMouseup.bind(this));
    }
}

const repositorySearch = new RepositorySearch();