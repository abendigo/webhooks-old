import http from 'http';
import crypto from 'crypto';
// import { exec } from 'child_process';

const SECRET = 'MY_GITHUB_WEBHOOK_SECRET';

const config = {
  github: {
    repositories: {
      "abendigo/myslots.club": {
        webhook_secret: 'MY_GITHUB_WEBHOOK_SECRET'
      },
      "abendigo/webkooks": {
        webhook_secret: 'MY_GITHUB_WEBHOOK_SECRET'
      }
    }
  }
}

http
  .createServer((req, res) => {
    req.on('data', chunk => {
      const signature = `sha1=${crypto
        .createHmac('sha1', SECRET)
        .update(chunk)
        .digest('hex')}`;
      const isAllowed = req.headers['x-hub-signature'] === signature;
      const body = JSON.parse(chunk);
      console.log({ isAllowed, body })
      // const isMaster = body?.ref === 'refs/heads/master';
      // if (isAllowed && isMaster) {
      //   // do something
      // }
    });
    res.end();
  })
  .listen(8080);

// repository.full_name
  /*
  {
  "deployment": {
    "url": "https://api.github.com/repos/abendigo/myslots.club/deployments/182742559",
    "id": 182742559,
    "node_id": "MDEwOkRlcGxveW1lbnQxODI3NDI1NTk=",
    "sha": "69b94fa5885ae36c3c76ae113d7ec6d654a02712",
    "ref": "master",
    "task": "deploy",
    "payload": {

    },
    "original_environment": "production",
    "environment": "production",
    "description": null,
    "creator": {
      "login": "github-actions[bot]",
      "id": 41898282,
      "node_id": "MDM6Qm90NDE4OTgyODI=",
      "avatar_url": "https://avatars2.githubusercontent.com/in/15368?v=4",
      "gravatar_id": "",
      "url": "https://api.github.com/users/github-actions%5Bbot%5D",
      "html_url": "https://github.com/apps/github-actions",
      "followers_url": "https://api.github.com/users/github-actions%5Bbot%5D/followers",
      "following_url": "https://api.github.com/users/github-actions%5Bbot%5D/following{/other_user}",
      "gists_url": "https://api.github.com/users/github-actions%5Bbot%5D/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/github-actions%5Bbot%5D/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/github-actions%5Bbot%5D/subscriptions",
      "organizations_url": "https://api.github.com/users/github-actions%5Bbot%5D/orgs",
      "repos_url": "https://api.github.com/users/github-actions%5Bbot%5D/repos",
      "events_url": "https://api.github.com/users/github-actions%5Bbot%5D/events{/privacy}",
      "received_events_url": "https://api.github.com/users/github-actions%5Bbot%5D/received_events",
      "type": "Bot",
      "site_admin": false
    },
    "created_at": "2019-11-18T02:22:06Z",
    "updated_at": "2019-11-18T02:22:06Z",
    "statuses_url": "https://api.github.com/repos/abendigo/myslots.club/deployments/182742559/statuses",
    "repository_url": "https://api.github.com/repos/abendigo/myslots.club"
  },
  "repository": {
    "id": 220251147,
    "node_id": "MDEwOlJlcG9zaXRvcnkyMjAyNTExNDc=",
    "name": "myslots.club",
    "full_name": "abendigo/myslots.club",
    "private": true,
    "owner": {
      "login": "abendigo",
      "id": 789956,
      "node_id": "MDQ6VXNlcjc4OTk1Ng==",
      "avatar_url": "https://avatars1.githubusercontent.com/u/789956?v=4",
      "gravatar_id": "",
      "url": "https://api.github.com/users/abendigo",
      "html_url": "https://github.com/abendigo",
      "followers_url": "https://api.github.com/users/abendigo/followers",
      "following_url": "https://api.github.com/users/abendigo/following{/other_user}",
      "gists_url": "https://api.github.com/users/abendigo/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/abendigo/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/abendigo/subscriptions",
      "organizations_url": "https://api.github.com/users/abendigo/orgs",
      "repos_url": "https://api.github.com/users/abendigo/repos",
      "events_url": "https://api.github.com/users/abendigo/events{/privacy}",
      "received_events_url": "https://api.github.com/users/abendigo/received_events",
      "type": "User",
      "site_admin": false
    },
    "html_url": "https://github.com/abendigo/myslots.club",
    "description": null,
    "fork": false,
    "url": "https://api.github.com/repos/abendigo/myslots.club",
    "forks_url": "https://api.github.com/repos/abendigo/myslots.club/forks",
    "keys_url": "https://api.github.com/repos/abendigo/myslots.club/keys{/key_id}",
    "collaborators_url": "https://api.github.com/repos/abendigo/myslots.club/collaborators{/collaborator}",
    "teams_url": "https://api.github.com/repos/abendigo/myslots.club/teams",
    "hooks_url": "https://api.github.com/repos/abendigo/myslots.club/hooks",
    "issue_events_url": "https://api.github.com/repos/abendigo/myslots.club/issues/events{/number}",
    "events_url": "https://api.github.com/repos/abendigo/myslots.club/events",
    "assignees_url": "https://api.github.com/repos/abendigo/myslots.club/assignees{/user}",
    "branches_url": "https://api.github.com/repos/abendigo/myslots.club/branches{/branch}",
    "tags_url": "https://api.github.com/repos/abendigo/myslots.club/tags",
    "blobs_url": "https://api.github.com/repos/abendigo/myslots.club/git/blobs{/sha}",
    "git_tags_url": "https://api.github.com/repos/abendigo/myslots.club/git/tags{/sha}",
    "git_refs_url": "https://api.github.com/repos/abendigo/myslots.club/git/refs{/sha}",
    "trees_url": "https://api.github.com/repos/abendigo/myslots.club/git/trees{/sha}",
    "statuses_url": "https://api.github.com/repos/abendigo/myslots.club/statuses/{sha}",
    "languages_url": "https://api.github.com/repos/abendigo/myslots.club/languages",
    "stargazers_url": "https://api.github.com/repos/abendigo/myslots.club/stargazers",
    "contributors_url": "https://api.github.com/repos/abendigo/myslots.club/contributors",
    "subscribers_url": "https://api.github.com/repos/abendigo/myslots.club/subscribers",
    "subscription_url": "https://api.github.com/repos/abendigo/myslots.club/subscription",
    "commits_url": "https://api.github.com/repos/abendigo/myslots.club/commits{/sha}",
    "git_commits_url": "https://api.github.com/repos/abendigo/myslots.club/git/commits{/sha}",
    "comments_url": "https://api.github.com/repos/abendigo/myslots.club/comments{/number}",
    "issue_comment_url": "https://api.github.com/repos/abendigo/myslots.club/issues/comments{/number}",
    "contents_url": "https://api.github.com/repos/abendigo/myslots.club/contents/{+path}",
    "compare_url": "https://api.github.com/repos/abendigo/myslots.club/compare/{base}...{head}",
    "merges_url": "https://api.github.com/repos/abendigo/myslots.club/merges",
    "archive_url": "https://api.github.com/repos/abendigo/myslots.club/{archive_format}{/ref}",
    "downloads_url": "https://api.github.com/repos/abendigo/myslots.club/downloads",
    "issues_url": "https://api.github.com/repos/abendigo/myslots.club/issues{/number}",
    "pulls_url": "https://api.github.com/repos/abendigo/myslots.club/pulls{/number}",
    "milestones_url": "https://api.github.com/repos/abendigo/myslots.club/milestones{/number}",
    "notifications_url": "https://api.github.com/repos/abendigo/myslots.club/notifications{?since,all,participating}",
    "labels_url": "https://api.github.com/repos/abendigo/myslots.club/labels{/name}",
    "releases_url": "https://api.github.com/repos/abendigo/myslots.club/releases{/id}",
    "deployments_url": "https://api.github.com/repos/abendigo/myslots.club/deployments",
    "created_at": "2019-11-07T14:06:58Z",
    "updated_at": "2019-11-18T02:21:52Z",
    "pushed_at": "2019-11-18T02:21:50Z",
    "git_url": "git://github.com/abendigo/myslots.club.git",
    "ssh_url": "git@github.com:abendigo/myslots.club.git",
    "clone_url": "https://github.com/abendigo/myslots.club.git",
    "svn_url": "https://github.com/abendigo/myslots.club",
    "homepage": null,
    "size": 1778,
    "stargazers_count": 0,
    "watchers_count": 0,
    "language": "HTML",
    "has_issues": true,
    "has_projects": true,
    "has_downloads": true,
    "has_wiki": true,
    "has_pages": false,
    "forks_count": 0,
    "mirror_url": null,
    "archived": false,
    "disabled": false,
    "open_issues_count": 0,
    "license": null,
    "forks": 0,
    "open_issues": 0,
    "watchers": 0,
    "default_branch": "master"
  },
  "sender": {
    "login": "github-actions[bot]",
    "id": 41898282,
    "node_id": "MDM6Qm90NDE4OTgyODI=",
    "avatar_url": "https://avatars2.githubusercontent.com/in/15368?v=4",
    "gravatar_id": "",
    "url": "https://api.github.com/users/github-actions%5Bbot%5D",
    "html_url": "https://github.com/apps/github-actions",
    "followers_url": "https://api.github.com/users/github-actions%5Bbot%5D/followers",
    "following_url": "https://api.github.com/users/github-actions%5Bbot%5D/following{/other_user}",
    "gists_url": "https://api.github.com/users/github-actions%5Bbot%5D/gists{/gist_id}",
    "starred_url": "https://api.github.com/users/github-actions%5Bbot%5D/starred{/owner}{/repo}",
    "subscriptions_url": "https://api.github.com/users/github-actions%5Bbot%5D/subscriptions",
    "organizations_url": "https://api.github.com/users/github-actions%5Bbot%5D/orgs",
    "repos_url": "https://api.github.com/users/github-actions%5Bbot%5D/repos",
    "events_url": "https://api.github.com/users/github-actions%5Bbot%5D/events{/privacy}",
    "received_events_url": "https://api.github.com/users/github-actions%5Bbot%5D/received_events",
    "type": "Bot",
    "site_admin": false
  }
}
*/
