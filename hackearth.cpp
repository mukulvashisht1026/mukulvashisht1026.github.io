#include "bits/stdc++.h"
using namespace std;
#define fi first
#define se second
#define ll long long
#define dbg(v) cerr<<#v<<" = "<<v<<'\n'
#define vi vector<int>
#define vl vector <ll>
#define pii pair<int,int>
#define vii vector < pii >
#define mp make_pair
#define db long double
#define pb push_back
#define all(s) s.begin(),s.end()
template < class P , class Q > ostream& operator<<(ostream& stream, pair < P , Q > v){ stream << "(" << v.fi << ',' << v.se << ")"; return stream;}
template < class T > ostream& operator<<(ostream& stream, const vector<T> v){ stream << "[ "; for (int i=0; i<(int)v.size(); i++) stream << v[i] << " "; stream << "]"; return stream;}
template < class T > T smin(T &a,T b) {if (a > b) a = b;return a;}
template < class T > T smax(T &a,T b) {if (a < b) a = b;return a;}
const int N = 1e6 + 5;
int s[N];
int n;
ll get_max(void) {
    ll sum = 0;
    ll ans = 0;
    for (int i = 1;i <= n;++i) {
        sum += s[i];
        smax(ans,sum);
        smax(sum,0ll);
    }
    return ans;
}
ll bst;
int count_max(void) {
    ll sum = 0;
    int ans= 0;
    for (int i = 1;i <= n;++i) {
        sum += s[i];
        if (sum == bst)
            ++ans,sum = 0;
        smax(sum,0ll);
    }
    return ans;
}
int main(void) {
    cin>>n;
    for (int i = 1;i <= n;++i)
        cin>>s[i];
    bst = get_max();
    cout << bst << ' ' << count_max() << '\n';
    return 0;
}